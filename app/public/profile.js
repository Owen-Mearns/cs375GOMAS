// Simulated user data
const userData = {
    username: "johndoe",
    email: "johndoe@example.com"
};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("username").textContent = userData.username;
    document.getElementById("email").textContent = userData.email;
});

document.getElementById("edit-button").addEventListener("click", () => {
    document.getElementById("edit-modal").style.display = "block";

    // Pre-fill form with existing data
    document.getElementById("edit-username").value = userData.username;
    document.getElementById("edit-email").value = userData.email;
});

document.getElementById("cancel-edit").addEventListener("click", () => {
    document.getElementById("edit-modal").style.display = "none";
});

document.getElementById("edit-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const updatedUsername = document.getElementById("edit-username").value;
    const updatedEmail = document.getElementById("edit-email").value;

    userData.username = updatedUsername;
    userData.email = updatedEmail;

    document.getElementById("username").textContent = userData.username;
    document.getElementById("email").textContent = userData.email;

    document.getElementById("edit-modal").style.display = "none";
});
