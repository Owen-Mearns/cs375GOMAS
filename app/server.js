// ... (keep all existing imports and initial setup)

app.post("/api/invest", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { symbol, amount, action = "buy" } = req.body; // action can be "buy" or "sell"
  
  if (!symbol || !amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid symbol or amount" });
  }

  try {
    const response = await axios.get("https://www.alphavantage.co/query", {
      params: {
        function: "GLOBAL_QUOTE",
        symbol: symbol,
        apikey: apiKey,
      },
    });

    let globalQuote = response.data["Global Quote"];
    if (!globalQuote || !globalQuote["05. price"]) {
      globalQuote = {};
      globalQuote["05. price"] = Math.random() * 200;
    }

    const stockPrice = parseFloat(globalQuote["05. price"]);
    const totalCost = amount * stockPrice;

    // Get user's current balance
    const userResult = await pool.query(
      "SELECT balance FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    let userBalance = parseFloat(userResult.rows[0].balance);

    if (action === "sell") {
      // Check if user has enough stocks to sell
      const portfolioResult = await pool.query(
        "SELECT amount FROM portfolios WHERE user_id = $1 AND symbol = $2",
        [userId, symbol]
      );

      if (portfolioResult.rows.length === 0 || portfolioResult.rows[0].amount < amount) {
        return res.status(400).json({ error: "Insufficient stocks to sell" });
      }

      // Update user balance (add money from sale)
      userBalance += totalCost;
      await pool.query(
        "UPDATE users SET balance = $1 WHERE id = $2",
        [userBalance, userId]
      );

      // Update portfolio
      const existingAmount = parseInt(portfolioResult.rows[0].amount);
      const newAmount = existingAmount - amount;

      if (newAmount === 0) {
        // Remove the stock entry if no shares left
        await pool.query(
          "DELETE FROM portfolios WHERE user_id = $1 AND symbol = $2",
          [userId, symbol]
        );
      } else {
        // Update the amount
        await pool.query(
          "UPDATE portfolios SET amount = $1 WHERE user_id = $2 AND symbol = $3",
          [newAmount, userId, symbol]
        );
      }

      // Record the sale transaction
      await pool.query(
        "INSERT INTO transactions (user_id, symbol, amount, price, type) VALUES ($1, $2, $3, $4, $5)",
        [userId, symbol, amount, stockPrice, 'sell']
      );

    } else { // Buy action
      if (userBalance < totalCost) {
        return res.status(400).json({ error: "Insufficient balance to invest in this stock" });
      }

      // Update user balance (subtract money for purchase)
      userBalance -= totalCost;
      await pool.query(
        "UPDATE users SET balance = $1 WHERE id = $2",
        [userBalance, userId]
      );

      // Update portfolio
      const portfolioResult = await pool.query(
        "SELECT * FROM portfolios WHERE user_id = $1 AND symbol = $2",
        [userId, symbol]
      );

      if (portfolioResult.rows.length > 0) {
        const existingAmount = parseInt(portfolioResult.rows[0].amount);
        const existingAvgPrice = parseFloat(portfolioResult.rows[0].average_price);
        const newAmount = existingAmount + amount;
        const newAvgPrice = (existingAmount * existingAvgPrice + amount * stockPrice) / newAmount;

        await pool.query(
          "UPDATE portfolios SET amount = $1, average_price = $2 WHERE user_id = $3 AND symbol = $4",
          [newAmount, newAvgPrice, userId, symbol]
        );
      } else {
        await pool.query(
          "INSERT INTO portfolios (user_id, symbol, amount, average_price) VALUES ($1, $2, $3, $4)",
          [userId, symbol, amount, stockPrice]
        );
      }

      // Record the purchase transaction
      await pool.query(
        "INSERT INTO transactions (user_id, symbol, amount, price, type) VALUES ($1, $2, $3, $4, $5)",
        [userId, symbol, amount, stockPrice, 'buy']
      );
    }

    res.status(200).json({ 
      message: `${action === 'sell' ? 'Sale' : 'Investment'} successful`,
      newBalance: userBalance
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: `Failed to process ${action}` });
  }
});

// Add this SQL to create the transactions table if you haven't already:
/*
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    symbol VARCHAR(10) NOT NULL,
    amount INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    type VARCHAR(4) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/

// Update the purchase history endpoint to show both buys and sells
app.get("/api/purchase-history", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      "SELECT symbol, amount, price, type, timestamp FROM transactions WHERE user_id = $1 ORDER BY timestamp DESC",
      [userId]
    );
    res.status(200).json({ history: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transaction history" });
  }
});

// Keep all other existing endpoints...