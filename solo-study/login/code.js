const form = document.querySelector("form");
const emailInput = document.querySelector("input[type='email']");
const passwordInput = document.querySelector("input[type='password']");

const message = document.createElement("p");
message.style.marginTop = "10px";
message.style.fontWeight = "bold";
form.appendChild(message);

form.addEventListener("submit", async function(e) {
    e.preventDefault();
    message.textContent = "";
    message.style.color = "red";

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "" || password === "") {
        message.textContent = "❌ Please fill all fields";
        return;
    }

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Set localStorage FIRST before anything else
        localStorage.setItem("loggedIn", "true");

        // Then load Firestore data
        const data = await loadFromFirestore(user.uid);

        localStorage.setItem("loggedInUser", JSON.stringify({
            uid: user.uid,
            username: data?.username || "User",
            email: user.email
        }));

        message.style.color = "green";
        message.textContent = "✅ Login successful! Redirecting...";

        setTimeout(() => window.location.href = "/index.html", 1000);

    } catch (error) {
        if (error.code === "auth/user-not-found" ||
            error.code === "auth/wrong-password" ||
            error.code === "auth/invalid-credential") {
            message.textContent = "❌ Incorrect email or password";
        } else {
            message.textContent = "❌ " + error.message;
        }
    }
});