
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

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

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


