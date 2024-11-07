// controllers/newsController.js
const axios = require('axios');

const NEWS_API_KEY = '526facf96c474d178441767ca6093a8c';
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

const getNews = async (req, res) => {
    const { query } = req.query;

    try {
        const response = await axios.get(NEWS_API_URL, {
            params: {
                q: query || 'stocks OR finance OR market', // Default to stock/finance-related topics
                language: 'en', // Optional: limit to English articles
                sortBy: 'relevance', // Sort articles by relevance to stocks/finance
                apiKey: NEWS_API_KEY,
            }
        });

        res.json(response.data.articles); // Send articles as JSON response
    } catch (error) {
        res.status(500).json({ message: 'Error fetching news', error });
    }
};

module.exports = { getNews };