const serverUrl = "http://localhost:3000";

async function fetchStockPrice(symbol) {
    try {
        const response = await fetch(`${serverUrl}/api/price/${symbol}`);
        const data = await response.json();
        return data.price;
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return null;
    }
}

async function addStock() {
    const ticker = document.getElementById("ticker").value.toUpperCase();
    const shares = parseInt(document.getElementById("shares").value);

    if (!ticker || isNaN(shares)) {
        alert("Please enter a valid ticker and share amount.");
        return;
    }

    const price = await fetchStockPrice(ticker);
    if (price) {
        await fetch(`${serverUrl}/api/portfolio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbol: ticker, shares, price }),
        });
        displayPortfolio();
    } else {
        alert("Unable to fetch stock price. Check the ticker symbol.");
    }
}