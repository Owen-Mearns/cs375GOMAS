
const env = require("../../env.json");


// Global variable to store portfolio, purchase history, and balance
let portfolio = {};
let purchaseHistory = [];
let balance = 1000; // Starting balance


// Function to add stock to the portfolio
function addToPortfolio(symbol, amount, stockPrice) {
    // Calculate total investment
    const totalCost = amount * stockPrice;

    // Check if the user has enough balance
    if (balance < totalCost) {
        alert('Insufficient balance to invest in this stock.');
        return; // Exit if not enough balance
    }

    // Deduct the amount from the balance
    balance -= totalCost;
    document.getElementById('balance').innerText = balance.toFixed(2); // Update displayed balance

    // If the stock symbol already exists, update the amount
    if (portfolio[symbol]) {
        portfolio[symbol].amount += amount; // Increase the amount
    } else {
        // If it doesn't exist, create a new entry
        portfolio[symbol] = {
            amount: amount,
            price: stockPrice
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
    const portfolioList = document.getElementById('portfolio-list');
    portfolioList.innerHTML = ''; // Clear current list

    for (const [symbol, data] of Object.entries(portfolio)) {
        const li = document.createElement('li');
        li.innerText = `${symbol}: ${data.amount} shares at $${data.price} each`;
        portfolioList.appendChild(li);
    }
}

// Function to display purchase history
function displayPurchaseHistory() {
    const historyList = document.getElementById('purchase-history');
    historyList.innerHTML = ''; // Clear current history

    purchaseHistory.forEach(entry => {
        const li = document.createElement('li');
        li.innerText = `${entry.symbol} - ${entry.amount} shares purchased at $${entry.price} on ${entry.time}`;
        historyList.appendChild(li);
    });
}

// Event listener for the invest button
document.getElementById('invest-button').addEventListener('click', async () => {
    const symbol = document.getElementById('stock-symbol').value.trim().toUpperCase();
    const amount = parseInt(document.getElementById('amount').value.trim());

    if (!symbol || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid stock symbol and amount.');
        return;
    }

    try {
        const stockData = await fetchStockData(symbol); // Fetch stock data
        const stockPrice = stockData['Global Quote']['05. price']; // Get the current stock price
        addToPortfolio(symbol, amount, parseFloat(stockPrice)); // Add to portfolio
    } catch (error) {
        console.error('Error fetching stock data:', error);
        alert('Could not fetch stock data. Please try again.');
    }
});


// Function to fetch stock data from the API
async function fetchStockData(symbol) {
    const apiKey = env.API_KEY;
    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`);
    const data = await response.json();
    return data;
}

// Toggle purchase history visibility
document.getElementById('toggle-history-button').addEventListener('click', function() {
    const historyContainer = document.getElementById('purchase-history-container');
    const buttonText = this.innerText;

    if (historyContainer.style.display === 'none') {
        historyContainer.style.display = 'block'; // Show history
        displayPurchaseHistory(); // Populate history
        this.innerText = 'Hide Purchase History'; // Change button text
    } else {
        historyContainer.style.display = 'none'; // Hide history
        this.innerText = 'Show Purchase History'; // Change button text
    }
});
