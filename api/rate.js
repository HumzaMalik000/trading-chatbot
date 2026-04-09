export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { from, to } = req.body;

    if (!from || !to) {
        return res.status(400).json({ error: 'Currency codes required' });
    }

    // Get API key from Vercel environment (SECURE - never exposed to browser)
    const apiKey = process.env.EXCHANGE_API_KEY;

    if (!apiKey) {
        // Fallback to simulated rate if no API key
        const fallbackRates = {
            "USD-PKR": 278.50,
            "EUR-PKR": 302.75,
            "GBP-PKR": 352.30
        };
        const rate = fallbackRates[`${from}-${to}`] || 278.50;
        return res.status(200).json({ rate });
    }

    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`);
        const data = await response.json();

        if (data.conversion_rate) {
            res.status(200).json({ rate: data.conversion_rate });
        } else {
            res.status(500).json({ error: 'Failed to fetch rate' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}
