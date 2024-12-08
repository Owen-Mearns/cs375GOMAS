// Global variable to store portfolio, purchase history, and balance
let portfolio = {};
let purchaseHistory = [];
let balance = 1000; // Starting balance

// Function to fetch stock data from the API
async function fetchStockData(symbol) {
  try {
    const response = await fetch(`/api/stock/${symbol}`);
    const data = await response.json();

    if (data["Global Quote"]) {
      return data;
    } else {
      throw new Error("Stock price not found");
    }
  } catch (error) {
    console.error("Error fetching stock data:", error.message);
    throw error;
  }
}

// Function to add stock to the portfolio
function addToPortfolio(symbol, amount, stockPrice) {
  // Calculate total investment
  const totalCost = amount * stockPrice;

  // Check if the user has enough balance
  if (balance < totalCost) {
    alert("Insufficient balance to invest in this stock.");
    return; // Exit if not enough balance
  }

  // Deduct the amount from the balance
  balance -= totalCost;
  document.getElementById("balance").innerText = balance.toFixed(2); // Update displayed balance

  // If the stock symbol already exists, update the amount
  if (portfolio[symbol]) {
    portfolio[symbol].amount += amount; // Increase the amount
  } else {
    // If it doesn't exist, create a new entry
    portfolio[symbol] = {
      amount: amount,
      price: stockPrice,
    };
  }

  // Log purchase history with timestamp
  const timestamp = new Date().toLocaleString();
  purchaseHistory.push({ symbol, amount, price: stockPrice, time: timestamp });

  // Update the portfolio display
  updatePortfolioDisplay();
}

// Function to update the portfolio display
function updatePortfolioDisplay() {
  const portfolioList = document.getElementById("portfolio-list");
  portfolioList.innerHTML = ""; // Clear current list

  for (const [symbol, data] of Object.entries(portfolio)) {
    const li = document.createElement("li");
    li.innerText = `${symbol}: ${data.amount} shares at $${data.price} each`;
    portfolioList.appendChild(li);
  }
}

// Function to display purchase history
/* DEPRECATED
function displayPurchaseHistory() {
  const historyList = document.getElementById("purchase-history");
  historyList.innerHTML = ""; // Clear current history

  purchaseHistory.forEach((entry) => {
    const li = document.createElement("li");
    li.innerText = `${entry.symbol} - ${entry.amount} shares purchased at $${entry.price} on ${entry.time}`;
    historyList.appendChild(li);
  });
}
*/

// Event listener for the invest button
document.getElementById("invest-button").addEventListener("click", async () => {
  const symbol = document
    .getElementById("stock-symbol")
    .value.trim()
    .toUpperCase();
  const amount = parseInt(document.getElementById("amount").value.trim());

  if (!symbol || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid stock symbol and amount.");
    return;
  }

  try {
    const response = await fetch("/api/invest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symbol, amount }),
    });
    if (response.ok) {
      alert("Investment successful!");
      fetchBalance();
      fetchPortfolio();
      fetchPurchaseHistory();
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.error}`);
    }
  } catch (error) {
    console.error("Error during investment:", error);
    alert("Could not complete investment. Please try again.");
  }
});

async function fetchBalance() {
  try {
    const response = await fetch("/api/balance", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const data = await response.json();
      document.getElementById("balance").innerText = data.balance.toFixed(2);
    } else {
      console.error("Failed to fetch balance");
    }
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
}

async function fetchPortfolio() {
  try {
    const response = await fetch("/api/portfolio", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const data = await response.json();
      const portfolioList = document.getElementById("portfolio-list");
      portfolioList.innerHTML = "";
      data.portfolio.forEach((item) => {
        const li = document.createElement("li");
        li.innerText = `${item.symbol}: ${item.amount} shares at $${parseFloat(item.average_price).toFixed(2)} each`;
        portfolioList.appendChild(li);
      });
    } else {
      console.error("Failed to fetch portfolio");
    }
  } catch (error) {
    console.error("Error fetching portfolio:", error);
  }
}

async function fetchPurchaseHistory() {
  try {
    const response = await fetch("/api/purchase-history", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const data = await response.json();
      const historyList = document.getElementById("purchase-history");
      historyList.innerHTML = "";
      data.history.forEach((entry) => {
        const li = document.createElement("li");
        li.innerText = `${entry.symbol} - ${entry.amount} shares purchased at $${parseFloat(entry.price).toFixed(2)} on ${new Date(entry.timestamp).toLocaleString()}`;
        historyList.appendChild(li);
        console.log(historyList.innerHTML);
      });
    } else {
      console.error("Failed to fetch purchase history");
    }
  } catch (error) {
    console.error("Error fetching purchase history:", error);
  }
}

// Toggle purchase history visibility
document
  .getElementById("toggle-history-button")
  .addEventListener("click", function () {
    const historyContainer = document.getElementById(
      "purchase-history-container",
    );
    const buttonText = this.innerText;

    if (historyContainer.style.display === "none") {
      historyContainer.style.display = "block"; // Show history
      fetchPurchaseHistory(); // Populate history
      this.innerText = "Hide Purchase History"; // Change button text
    } else {
      historyContainer.style.display = "none"; // Hide history
      this.innerText = "Show Purchase History"; // Change button text
    }
  });

fetchBalance();
fetchPortfolio();
fetchPurchaseHistory();
