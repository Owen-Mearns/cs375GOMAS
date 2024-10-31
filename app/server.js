const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

const apiKey = "FSOY6AHF5KW0FDA1"; // Replace with your actual API key
const apiUrl = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=";
const portfolio = [];

// Middleware to parse JSON bodies
app.use(express.json());

// Route to fetch stock price from the API
app.get('/api/price/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        const response = await axios.get(`${apiUrl}${symbol}&apikey=${apiKey}`);
        const price = parseFloat(response.data["Global Quote"]["05. price"]);
        if (price) {
            res.json({ symbol, price });
        } else {
            res.status(404).json({ error: "Stock symbol not found" });
        }
    } catch (error) {
        console.error("Error fetching stock data:", error);
        res.status(500).json({ error: "Failed to fetch stock price" });
    }
});

// Route to add a stock to the portfolio
app.post('/api/portfolio', (req, res) => {
    const { symbol, shares, price } = req.body;
    if (!symbol || isNaN(shares) || isNaN(price)) {
        return res.status(400).json({ error: "Invalid data" });
    }
    const stock = { symbol, shares, price };
    portfolio.push(stock);
    res.json({ message: "Stock added", portfolio });
});

// Route to get the current portfolio
app.get('/api/portfolio', (req, res) => {
    const totalValue = portfolio.reduce((acc, stock) => acc + stock.shares * stock.price, 0);
    res.json({ portfolio, totalValue });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
