// Global variables for balance, portfolio, purchase history
let balance = 1000;
let portfolio = {};
let purchaseHistory = [];
// Load API key from env.json
const env = JSON.parse(fs.readFileSync('env.json', 'utf-8'));
const ALPHA_VANTAGE_API_KEY = "OI7SQ4A96TB4RLLF";
//const ALPHA_VANTAGE_API_KEY = env.apiKey;

// Function to fetch stock data
async function fetchStockData(symbol) {
    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`);
    if (!response.ok) throw new Error("Failed to fetch stock data");
    return await response.json();
}

// Function to add stocks to the portfolio
function addToPortfolio(symbol, amount, stockPrice) {
    const totalCost = amount * stockPrice;

    if (balance < totalCost) {
        alert("Insufficient balance to invest.");
        return;
    }

    balance -= totalCost;
    portfolio[symbol] = portfolio[symbol] || { amount: 0, averagePrice: 0 };
    const prevAmount = portfolio[symbol].amount;
    portfolio[symbol].amount += amount;
    portfolio[symbol].averagePrice = 
        ((prevAmount * portfolio[symbol].averagePrice) + totalCost) / portfolio[symbol].amount;

    purchaseHistory.push({ symbol, amount, price: stockPrice, type: "Buy", time: new Date().toLocaleString() });
    updateUI();
}

// Function to sell stocks
function sellFromPortfolio(symbol, amount, stockPrice) {
    if (!portfolio[symbol] || portfolio[symbol].amount < amount) {
        alert("Not enough shares to sell.");
        return;
    }

    const totalGain = amount * stockPrice;
    portfolio[symbol].amount -= amount;
    balance += totalGain;

    if (portfolio[symbol].amount === 0) delete portfolio[symbol];

    purchaseHistory.push({ symbol, amount, price: stockPrice, type: "Sell", time: new Date().toLocaleString() });
    updateUI();
}

// Function to update the UI
function updateUI() {
    document.getElementById("balance").innerText = balance.toFixed(2);

    const portfolioList = document.getElementById("portfolio-list");
    portfolioList.innerHTML = "";
    for (const [symbol, data] of Object.entries(portfolio)) {
        const li = document.createElement("li");
        li.innerText = `${symbol}: ${data.amount} shares at $${data.averagePrice.toFixed(2)} each`;
        portfolioList.appendChild(li);
    }
}

// Function to check for price fluctuations
async function monitorStockPrices() {
    for (const symbol of Object.keys(portfolio)) {
        try {
            const data = await fetchStockData(symbol);
            const currentPrice = parseFloat(data["Global Quote"]["05. price"]);
            const averagePrice = portfolio[symbol].averagePrice;
            const changePercent = ((currentPrice - averagePrice) / averagePrice) * 100;

            if (Math.abs(changePercent) >= 5) {
                alert(`Alert: ${symbol} price changed by ${changePercent.toFixed(2)}%! Current Price: $${currentPrice}`);
            }
        } catch (error) {
            console.error(`Error monitoring ${symbol}:`, error);
        }
    }
}

// Set up event listeners
document.getElementById("invest-button").addEventListener("click", async () => {
    const symbol = document.getElementById("stock-symbol").value.trim().toUpperCase();
    const amount = parseInt(document.getElementById("amount").value.trim());
    if (!symbol || isNaN(amount) || amount <= 0) {
        alert("Invalid input.");
        return;
    }

    try {
        const data = await fetchStockData(symbol);
        const stockPrice = parseFloat(data["Global Quote"]["05. price"]);
        addToPortfolio(symbol, amount, stockPrice);
    } catch (error) {
        alert("Error fetching stock data.");
    }
});

document.getElementById("sell-button").addEventListener("click", async () => {
    const symbol = document.getElementById("stock-symbol").value.trim().toUpperCase();
    const amount = parseInt(document.getElementById("amount").value.trim());
    if (!symbol || isNaN(amount) || amount <= 0) {
        alert("Invalid input.");
        return;
    }

    try {
        const data = await fetchStockData(symbol);
        const stockPrice = parseFloat(data["Global Quote"]["05. price"]);
        sellFromPortfolio(symbol, amount, stockPrice);
    } catch (error) {
        alert("Error fetching stock data.");
    }
});

// Toggle purchase history
document.getElementById("toggle-history-button").addEventListener("click", () => {
    const historyContainer = document.getElementById("purchase-history-container");
    historyContainer.style.display = historyContainer.style.display === "none" ? "block" : "none";

    const historyList = document.getElementById("purchase-history");
    historyList.innerHTML = "";
    purchaseHistory.forEach(({ symbol, amount, price, type, time }) => {
        const li = document.createElement("li");
        li.innerText = `${type} - ${symbol}: ${amount} shares at $${price} on ${time}`;
        historyList.appendChild(li);
    });
});

// Start monitoring price changes
setInterval(monitorStockPrices, 60000); // Every 60 seconds
