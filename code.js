// Show/hide buttons based on login state
function updateNavButtons() {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const logoutBtn = document.getElementById("logoutBtn");
    const profileLink = document.getElementById("profileLink");
    const loginLink = document.getElementById("loginLink");
    const signupLink = document.getElementById("signupLink");

    if (loggedIn) {
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (profileLink) profileLink.style.display = "inline";
        if (loginLink) loginLink.style.display = "none";
        if (signupLink) signupLink.style.display = "none";
    }
}

updateNavButtons();

// Protect lesson links
document.querySelectorAll(".hero-btn, .grade-card a").forEach(btn => {
    btn.addEventListener("click", e => {
        if (localStorage.getItem("loggedIn") !== "true") {
            e.preventDefault();
            alert("Please log in first to access lessons!");
            window.location.href = "/login/index.html";
        }
    });
});
// Logout function
document.getElementById("logoutBtn")?.addEventListener("click", function () {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedInUser");
    window.location.href = "/index.html";
});
