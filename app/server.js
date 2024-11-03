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
app.use(express.static(path.join(__dirname, 'public')));

//Simple function to see if you have connected to the API or not.
app.get('/api/status', async (req, res) => {
    try {
        let response = await axios.get(`${apiUrl}AAPL&apikey=${apiKey}`);
        
        //Global quote is one of the things you recieve no matter what, so if you dont get this, the API is not connected.
        if (response.data && response.data['Global Quote']) {
            res.status(200).json({ status: 'connected' });
        } else {
            res.status(400).json({ status: 'disconnected' });
        }
    } catch (error) {
        res.status(500).json({ status: 'disconnected' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
