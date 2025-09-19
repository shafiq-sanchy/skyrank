const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            isAppLoaded: false,
            user: {
                loggedIn: false,
                data: null
            },
            isLoginView: true,
            regEmail: '',
            regPassword: '',
            loginEmail: '',
            loginPassword: '',
            activeTool: 'meta-enhancement',
            metaInput: '',
            metaOutput: '',
            loading: false,
            firebaseConfig: {
                // অনুগ্রহ করে নিশ্চিত করুন যে এই মানগুলো আপনার
                // Firebase প্রজেক্ট সেটিংস থেকে হুবহু কপি করা হয়েছে
                apiKey: "YOUR_API_KEY",
                authDomain: "YOUR_AUTH_DOMAIN",
                projectId: "YOUR_PROJECT_ID",
                storageBucket: "YOUR_STORAGE_BUCKET",
                messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
                appId: "YOUR_APP_ID"
            },
            auth: null
        };
    },
    mounted() {
        firebase.initializeApp(this.firebaseConfig);
        this.auth = firebase.auth();

        this.auth.onAuthStateChanged(user => {
            if (user) {
                this.user.loggedIn = true;
                this.user.data = user;
            } else {
                this.user.loggedIn = false;
                this.user.data = null;
            }
            
            this.isAppLoaded = true;
            if (document.getElementById('loading-indicator')) {
                document.getElementById('loading-indicator').style.display = 'none';
            }
        });
    },
    methods: {
        async registerUser() {
            if (!this.regEmail || !this.regPassword) {
                alert('Please enter both email and password.');
                return;
            }
            try {
                const userCredential = await this.auth.createUserWithEmailAndPassword(this.regEmail, this.regPassword);
                console.log('User registered:', userCredential.user);
                this.isLoginView = true;
            } catch (error) {
                alert(`Registration failed: ${error.message}`);
                console.error(error);
            }
        },
        async loginUser() {
            if (!this.loginEmail || !this.loginPassword) {
                alert('Please enter both email and password.');
                return;
            }
            try {
                const userCredential = await this.auth.signInWithEmailAndPassword(this.loginEmail, this.loginPassword);
                console.log('User logged in:', userCredential.user);
            } catch (error) {
                alert(`Login failed: ${error.message}`);
                console.error('Firebase Login Error:', error); // More detailed log
            }
        },
        async logoutUser() {
            try {
                await this.auth.signOut();
                console.log('User logged out');
            } catch (error) {
                alert(`Logout failed: ${error.message}`);
                console.error(error);
            }
        },
        async generateMetaTags() {
            if (!this.metaInput.trim()) {
                alert('Please enter your current meta tags.');
                return;
            }
            if (!this.auth.currentUser) {
                alert('You must be logged in to use this feature.');
                return;
            }
            this.loading = true;
            this.metaOutput = '';

            try {
                const idToken = await this.auth.currentUser.getIdToken();
                const response = await fetch('/.netlify/functions/generate-meta', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({ text: this.metaInput })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to get a response from the server.');
                }

                const data = await response.json();
                this.metaOutput = data.result;
            } catch (error) {
                console.error('Error:', error);
                alert(`An error occurred: ${error.message}`);
            } finally {
                this.loading = false;
            }
        }
    }
});

app.mount('#app');
