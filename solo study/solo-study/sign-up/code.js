// -----------------------
// SIGN-UP PAGE JS
// -----------------------

// Redirect already logged-in users
const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (loggedUser) {
    window.location.href = "/solo-study/home/index.html";
}

// Select form elements
const form = document.querySelector("form");
const usernameInput = document.querySelector("input[type='text']");
const emailInput = document.querySelector("input[type='email']");
const passwordInput = document.querySelectorAll("input[type='password']")[0];
const confirmPasswordInput = document.querySelectorAll("input[type='password']")[1];

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

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Validation: empty fields
    if (username === "" || email === "" || password === "" || confirmPassword === "") {
        message.textContent = "❌ Please fill all fields";
        return;
    }

    // Validation: password length
    if (password.length < 6) {
        message.textContent = "❌ Password must be at least 6 characters";
        return;
    }

    // Validation: passwords match
    if (password !== confirmPassword) {
        message.textContent = "❌ Passwords do not match";
        return;
    }

    // Get existing users array
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if email already exists
    const emailExists = users.find(u => u.email === email);
    if (emailExists) {
        message.textContent = "❌ An account with this email already exists";
        return;
    }

    // Build new user object
    const newUser = {
        username: username,
        email: email,
        password: password
    };

    // Add to users array and save
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Automatically mark as logged in
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("loggedInUser", JSON.stringify(newUser));

    // Success message
    message.style.color = "green";
    message.textContent = "✅ Account created successfully! Redirecting...";

    // Redirect to home page
    setTimeout(() => {
        window.location.href = "/solo-study/home/index.html";
    }, 1500);
});