async function fetchProfile() {
    try {
        const response = await fetch('/api/profile');

        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();

        const username = data.username;
        const balance = parseFloat(data.balance).toFixed(2);

        document.getElementById('username').textContent = username;
        document.getElementById('balance').textContent = `$${balance}`;
    } catch (error) {
        alert('Could not load profile data.');
    }
}

async function fetchPurchaseHistory() {
    try {
        const response = await fetch('/api/purchase-history');

        if (!response.ok) throw new Error('Failed to fetch purchase history');

        const data = await response.json();

        const historyList = document.getElementById('purchase-history');
        historyList.innerHTML = ''; 

        data.history.forEach((entry) => {

            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${entry.symbol}</strong>: ${entry.amount} shares purchased at $${parseFloat(entry.price).toFixed(2)}
                on ${new Date(entry.timestamp).toLocaleString()}
            `;
            historyList.appendChild(li);
        });

    } catch (error) {
        console.error("Error fetching purchase history:", error);
    }
}



document.getElementById('toggle-history-button').addEventListener('click', () => {
    const container = document.getElementById('purchase-history-container');
    if (container.style.display === 'none') {
        container.style.display = 'block';
        fetchPurchaseHistory();
        document.getElementById('toggle-history-button').textContent = 'Hide Purchase History';
    } else {
        container.style.display = 'none';
        document.getElementById('toggle-history-button').textContent = 'Show Purchase History';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchProfile();
    fetchPortfolio();
    fetchPurchaseHistory();
});

document.getElementById('logout-button').addEventListener('click', () => {
    fetch('/logout', { method: 'POST' })
        .then(() => window.location.href = '/login.html')
        .catch((error) => console.error('Error logging out:', error));
});
