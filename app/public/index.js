
        async function checkApiStatus() {
            try {
                let response = await fetch('/api/status');
                let data = await response.json();
                
                // Update the page with the API status
                let statusElement = document.getElementById('api-status');
                if (data.status === 'connected') {
                    statusElement.textContent = 'API is connected';
                    statusElement.style.color = 'green';
                } else {
                    statusElement.textContent = 'API is not connected';
                    statusElement.style.color = 'red';
                }
            } catch (error) {
                console.error('Error checking API status:', error);
            }
        }

        document.getElementById("signupButton").addEventListener("click", function() {
            window.location.href = 'signup.html';
        });

        document.getElementById("loginButton").addEventListener("click", function() {
            window.location.href = 'login.html';
        });
        checkApiStatus();
