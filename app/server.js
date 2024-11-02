const express = require('express');
const pg = require("pg");
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Load environment variables from env.json
const env = require("../env.json");
const apiKey = env.API_KEY;
const apiUrl = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=";
const portfolio = [];

app.use(express.json());
app.use(express.static(path.join('public')));

//Simple function to see if you have connected to the API or not.
app.get('/api/status', async (req, res) => {
    try {
        let response = await axios.get(`${apiUrl}AAPL&apikey=${apiKey}`);
        
        if (response.data && response.data['Global Quote']) {
            res.json({ status: 'connected' }).status(200).send();
        } else {
            res.json({ status: 'disconnected' }).status(400).send();
        }
    } catch (error){
        res.json({ status: 'disconnected' }).status(500).send();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
