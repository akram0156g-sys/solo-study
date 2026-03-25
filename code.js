// =====================
// HOME PAGE JS - NON-INTRUSIVE LOGIN
// =====================

// Get user from localStorage
const user = JSON.parse(localStorage.getItem("user"));
const loggedIn = localStorage.getItem("loggedIn") === "true";

// =====================
// Update Navbar dynamically
// =====================
const navRight = document.querySelector(".nav-right");
if(navRight){
    // Remove Sign Up button if logged in
    const signUpBtn = navRight.querySelector(".nav-sign-in");
    if(loggedIn && signUpBtn) signUpBtn.style.display = "none";

    // Replace Get Started button with Welcome message
    const getStarted = navRight.querySelector(".nav-btn");
    if(getStarted){
        if(loggedIn){
            getStarted.textContent = `Welcome, ${user.username}`;
            getStarted.style.cursor = "default";
            getStarted.disabled = true;
        } else {
            getStarted.addEventListener("click", e => {
                alert("Please login to start lessons.");
                e.preventDefault();
                window.location.href = "../login/index.html";
            });
        }
    }

    // Add Logout button if logged in
    if(loggedIn){
        const logoutBtn = document.createElement("button");
        logoutBtn.textContent = "Logout";
        logoutBtn.className = "nav-btn";
        logoutBtn.style.marginLeft = "10px";
        logoutBtn.onclick = () => {
            localStorage.removeItem("loggedIn");
            window.location.reload(); // refresh to update navbar
        };
        navRight.appendChild(logoutBtn);
    }
}

// =====================
// Optional: show XP / Level if user logged in
// =====================
let xp = parseInt(localStorage.getItem("xp")) || 0;

function calculateLevel(){
    return Math.floor(xp / 100) + 1;
}

function updateHomeStats(){
    let statsDiv = document.querySelector(".home-stats");
    if(!statsDiv){
        statsDiv = document.createElement("div");
        statsDiv.className = "home-stats";
        statsDiv.style.marginTop = "20px";
        statsDiv.style.textAlign = "center";
        document.body.insertBefore(statsDiv, document.querySelector(".hero"));
    }

    if(loggedIn){
        statsDiv.innerHTML = `
            <p>Level: ${calculateLevel()}</p>
            <p>XP: ${xp}</p>
        `;
    } else {
        statsDiv.innerHTML = `<p>Login to track your XP and level!</p>`;
    }
}

updateHomeStats();

// =====================
// Protect lesson links and grade cards
// =====================
document.querySelectorAll(".hero-btn, .grade-card a").forEach(btn=>{
    btn.addEventListener("click", e=>{
        if(!loggedIn){
            e.preventDefault();
            alert("Please log in first to access lessons!");
            window.location.href = "../login/index.html";
        }
    });
});
// Show/hide logout button based on login state
function updateNavButtons() {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const logoutBtn = document.getElementById("logoutBtn");
    const getStartedBtn = document.querySelector(".nav-btn:not(.logout-btn)");
    const signInBtn = document.querySelector(".nav-sign-in");
    const profileLink = document.getElementById("profileLink");

    if (loggedIn) {
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (getStartedBtn) getStartedBtn.style.display = "none";
        if (signInBtn) signInBtn.style.display = "none";
        if (profileLink) profileLink.style.display = "inline";
    }
}

// Logout function
document.getElementById("logoutBtn")?.addEventListener("click", function () {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedInUser");
    window.location.href = "/index.html";
});

updateNavButtons();