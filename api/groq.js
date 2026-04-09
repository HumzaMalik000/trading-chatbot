export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Get API key from Vercel environment (SECURE - never exposed to browser)
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ 
            reply: "⚠️ Groq AI is not configured. Please add GROQ_API_KEY to Vercel environment variables." 
        });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are TradeMaster AI, a professional trading assistant. 
                        Help users with forex, stocks, crypto, and trading education.
                        Give concise, accurate responses about trading.
                        Always include a disclaimer that this is not financial advice.
                        Keep responses under 200 words.`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;

        res.status(200).json({ reply: reply || "I couldn't generate a response. Please try again." });

    } catch (error) {
        console.error('Groq API error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
