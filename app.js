const { createApp } = Vue;
const { initializeApp } = firebase;
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } = firebase.auth;

const app = createApp({
    data() {
        return {
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
                apiKey: "AIzaSyBOyALLQ2b0ridPyJarUoZOtT1PerCc_ZA",
                authDomain: "skyrank-67ed0.firebaseapp.com",
                projectId: "skyrank-67ed0",
                storageBucket: "skyrank-67ed0.firebasestorage.app",
                messagingSenderId: "89249908989",
                appId: "1:89249908989:web:a0f5d6df2d6bdb2a91d694"
            },
            auth: null
        };
    },
    mounted() {
        const firebaseApp = initializeApp(this.firebaseConfig);
        this.auth = getAuth(firebaseApp);

        onAuthStateChanged(this.auth, user => {
            if (user) {
                this.user.loggedIn = true;
                this.user.data = user;
            } else {
                this.user.loggedIn = false;
                this.user.data = null;
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
                const userCredential = await createUserWithEmailAndPassword(this.auth, this.regEmail, this.regPassword);
                console.log('User registered:', userCredential.user);
                this.isLoginView = true; // Switch to login view after registration
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
                const userCredential = await signInWithEmailAndPassword(this.auth, this.loginEmail, this.loginPassword);
                console.log('User logged in:', userCredential.user);
            } catch (error) {
                alert(`Login failed: ${error.message}`);
                console.error(error);
            }
        },
        async logoutUser() {
            try {
                await signOut(this.auth);
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
            this.loading = true;
            this.metaOutput = '';

            try {
                const response = await fetch('/.netlify/functions/generate-meta', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
