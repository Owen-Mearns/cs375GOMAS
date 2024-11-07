const http = require("http");
const express = require('express');
const pg = require("pg");
const axios = require('axios');
const bcrypt = require("bcrypt");
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;


// Load environment variables from env.json
const env = require("../env.json");
const apiKey = env.API_KEY;
const apiUrl = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=";
const portfolio = [];

const { Pool } = require("pg");

// Initialize the pool with your database credentials
const pool = new Pool({
    user: env.user,         // Replace with your database username
    host: env.host,         // Replace with your database host, usually 'localhost'
    database: env.db_name,     // Replace with your database name
    password: env.password, // Replace with your database password
    port: env.post          // Replace with your database port, usually 5432
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const newsRoutes = require('./routes/news');

app.use('/api/news', newsRoutes);

app.use(express.urlencoded({ extended: true }));

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
})
let balance = 10000;  // Initial balance
let stocks = [];      // Array to hold stock investments

const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/invest") {
        let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
        });
        req.on("end", () => {
            const { symbol, amount } = JSON.parse(body);
            amount = parseFloat(amount);

            if (amount > balance) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Insufficient funds" }));
                return;
            }

            balance -= amount;
            stocks.push({ symbol, amount });

            const response = {
                balance: balance.toFixed(2),
                stocks: stocks
            };
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(response));
        });
    } else if (req.method === "GET" && req.url.startsWith("/")) {
        const filePath = path.join(__dirname, "public", req.url === "/" ? "invest.html" : req.url);
        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".wav": "audio/wav",
            ".mp4": "video/mp4",
            ".woff": "application/font-woff",
            ".ttf": "application/font-ttf",
            ".eot": "application/vnd.ms-fontobject",
            ".otf": "application/font-sfnt",
            ".ico": "image/x-icon"
        };

        const contentType = mimeTypes[extname] || "application/octet-stream";
        fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(500);
                res.end(`Sorry, there was an error: ${error.code}`);
            } else {
                res.writeHead(200, { "Content-Type": contentType });
                res.end(content, "utf-8");
            }
        });
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});



app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!password) {
      return res.status(400).json({ message: "Password is required" });
  }

  try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
          "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
          [username, hashedPassword]
      );

      res.status(201).json({ message: "User created successfully", userId: result.rows[0].id });
  } catch (err) {
      res.status(500).json({ message: "Error creating user", error: err.message });
  }
});



app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
      const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

      if (result.rows.length > 0) {
          const user = result.rows[0];
          
          const isMatch = await bcrypt.compare(password, user.password);
          
          if (isMatch) {
              res.status(200).json({ message: "Login successful", userId: user.id });
          } else {
              res.status(401).json({ message: "Invalid credentials" });
          }
      } else {
          res.status(401).json({ message: "User not found" });
      }
  } catch (err) {
      res.status(500).json({ message: "Error logging in" });
  }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

