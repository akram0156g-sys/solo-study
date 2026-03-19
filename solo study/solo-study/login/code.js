// -----------------------
// LOGIN PAGE JS
// -----------------------

// Redirect already logged-in users
const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (loggedUser) {
    window.location.href = "/solo-study/home/index.html";
}

// Select elements
const form = document.querySelector("form");
const emailInput = document.querySelector("input[type='email']");
const passwordInput = document.querySelector("input[type='password']");

// Create message element
const message = document.createElement("p");
message.style.marginTop = "10px";
message.style.fontWeight = "bold";
form.appendChild(message);

// Handle form submission
form.addEventListener("submit", function(e) {
    e.preventDefault();

    // Reset message
    message.textContent = "";
    message.style.color = "red";

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Check for empty fields
    if (email === "" || password === "") {
        message.textContent = "❌ Please fill all fields";
        return;
    }

    // Get all saved users
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // No accounts exist
    if (users.length === 0) {
        message.textContent = "❌ No account found. Please sign up.";
        return;
    }

    // Find matching user
    const matchedUser = users.find(u => u.email === email && u.password === password);

    if (matchedUser) {
        message.style.color = "green";
        message.textContent = "✅ Login successful! Redirecting...";

        // Save login state
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("loggedInUser", JSON.stringify(matchedUser));

        // Redirect to home page
        setTimeout(() => {
            window.location.href = "/solo-study/home/index.html";
        }, 1000);

    } else {
        message.textContent = "❌ Incorrect email or password";
    }
});