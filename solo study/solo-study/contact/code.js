// -----------------------
// CONTACT PAGE JS
// -----------------------

// Load EmailJS
const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
script.onload = function() {
    emailjs.init("wensWMFYKPiVAWoZr");
};
document.head.appendChild(script);

// Select form elements
const form = document.querySelector("form");
const nameInput = document.querySelector("input[type='text']");
const emailInput = document.querySelector("input[type='email']");
const messageInput = document.querySelector("textarea");

// Create feedback element
const feedback = document.createElement("p");
feedback.style.marginTop = "10px";
feedback.style.fontWeight = "bold";
form.appendChild(feedback);

// Handle form submission
form.addEventListener("submit", function(e) {
    e.preventDefault();

    // Reset feedback
    feedback.textContent = "";
    feedback.style.color = "red";

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    // Validation
    if (name === "" || email === "" || message === "") {
        feedback.textContent = "❌ Please fill all fields";
        return;
    }

    if (message.length < 10) {
        feedback.textContent = "❌ Message must be at least 10 characters";
        return;
    }

    // Show sending state
    feedback.style.color = "#6b7280";
    feedback.textContent = "⏳ Sending...";

    // Send via EmailJS
    emailjs.send("service_vh4u8fe", "template_55cj6op", {
        from_name: name,
        from_email: email,
        message: message
    })
    .then(function() {
        // Success
        feedback.style.color = "green";
        feedback.textContent = "✅ Message sent! We'll get back to you soon.";

        form.reset();

        // Re-fill after reset if logged in
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (loggedInUser) {
            nameInput.value = loggedInUser.username;
            emailInput.value = loggedInUser.email;
        }

    }, function(error) {
        // Error
        feedback.style.color = "red";
        feedback.textContent = "❌ Failed to send. Please try again.";
        console.error("EmailJS error:", error);
    });
});

// Pre-fill if logged in
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (loggedInUser) {
    nameInput.value = loggedInUser.username;
    emailInput.value = loggedInUser.email;
}