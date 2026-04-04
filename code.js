// Wait for Firebase auth state
firebase.auth().onAuthStateChanged(function(user) {
    const authButtons  = document.getElementById('authButtons');
    const profileLink  = document.getElementById('profileLink');
    const logoutBtn    = document.getElementById('logoutBtn');
    const mobileLogin  = document.getElementById('mobileLoginItem');
    const mobileSignup = document.getElementById('mobileSignupItem');

    if (user) {
        // Logged in
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("loggedInUser", user.email);

        if (authButtons)  authButtons.style.display  = 'none';
        if (profileLink)  profileLink.style.display  = 'inline';
        if (logoutBtn)    logoutBtn.style.display     = 'inline-block';
        if (mobileLogin)  mobileLogin.style.display  = 'none';
        if (mobileSignup) mobileSignup.style.display = 'none';
    } else {
        // Logged out
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("loggedInUser");

        if (authButtons)  authButtons.style.display  = 'flex';
        if (profileLink)  profileLink.style.display  = 'none';
        if (logoutBtn)    logoutBtn.style.display     = 'none';
        if (mobileLogin)  mobileLogin.style.display  = 'list-item';
        if (mobileSignup) mobileSignup.style.display = 'list-item';
    }
});

// Logout button
document.getElementById("logoutBtn")?.addEventListener("click", function () {
    firebase.auth().signOut().then(() => {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("loggedInUser");
        window.location.href = "/index.html";
    });
});

// Protect lesson links
document.querySelectorAll(".hero-btn, .grade-card a").forEach(btn => {
    btn.addEventListener("click", e => {
        if (!firebase.auth().currentUser) {
            e.preventDefault();
            alert("Please log in first to access lessons!");
            window.location.href = "/login/index.html";
        }
    });
});
