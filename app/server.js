const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();
const port = 3000;

// Load environment variables from env.json
const env = JSON.parse(fs.readFileSync('env.json', 'utf8'));
const apiKey = env.API_KEY;
const apiUrl = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=";
const portfolio = [];

// Middleware to parse JSON bodies
app.use(express.json());

// Your existing routes here...

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});