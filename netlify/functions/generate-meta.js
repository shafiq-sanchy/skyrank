const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// This uses the environment variable we set in Netlify
try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK))
        });
    }
} catch (e) {
    console.error('Firebase admin initialization error', e.stack);
}

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // 1. Verify user token
    const token = event.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized: No token provided.' }) };
    }

    try {
        await admin.auth().verifyIdToken(token);
    } catch (error) {
        console.error('Token verification error:', error);
        return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized: Invalid token.' }) };
    }

    // 2. If token is valid, proceed with the AI call
    try {
        const { text } = JSON.parse(event.body);
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Rewrite the following meta title and description to be more engaging, SEO-friendly, and boost click-through rate (CTR). Keep it keyword-rich. Provide 3 different suggestions.\n\nCurrent Meta Tags: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResultText = response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ result: aiResultText })
        };

    } catch (error) {
        console.error("Error generating content:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate content.' })
        };
    }
};
