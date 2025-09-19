const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { text } = JSON.parse(event.body);
        
        // Access your Google AI API key from environment variables
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
