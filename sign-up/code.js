// Redirect already logged-in users
auth.onAuthStateChanged(function(user) {
    if (user) window.location.href = "/index.html";
});

const form = document.querySelector("form");
const usernameInput = document.querySelector("input[type='text']");
const emailInput = document.querySelector("input[type='email']");
const passwordInput = document.querySelectorAll("input[type='password']")[0];
const confirmPasswordInput = document.querySelectorAll("input[type='password']")[1];

const message = document.createElement("p");
message.style.marginTop = "10px";
message.style.fontWeight = "bold";
form.appendChild(message);

form.addEventListener("submit", async function(e) {
    e.preventDefault();
    message.textContent = "";
    message.style.color = "red";

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (username === "" || email === "" || password === "" || confirmPassword === "") {
        message.textContent = "❌ Please fill all fields";
        return;
    }

    if (password.length < 6) {
        message.textContent = "❌ Password must be at least 6 characters";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "❌ Passwords do not match";
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Save new user data to Firestore
        await db.collection("users").doc(user.uid).set({
            username: username,
            email: email,
            xp: 0,
            streakData: { count: 0, lastDate: "", completedDates: [] },
            lessons: {},
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Save to localStorage
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("loggedInUser", JSON.stringify({ uid: user.uid, username: username, email: email }));
        localStorage.setItem("xp", "0");
        localStorage.setItem("streakData", JSON.stringify({ count: 0, lastDate: "", completedDates: [] }));

        message.style.color = "green";
        message.textContent = "✅ Account created! Redirecting...";

        setTimeout(() => window.location.href = "/index.html", 1500);

    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            message.textContent = "❌ An account with this email already exists";
        } else {
            message.textContent = "❌ " + error.message;
        }
    }
});