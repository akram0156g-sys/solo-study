firebase.auth().onAuthStateChanged(function(user) {
    const authButtons  = document.getElementById('authButtons');
    const profileLink  = document.getElementById('profileLink');
    const logoutBtn    = document.getElementById('logoutBtn');
    const mobileLogin  = document.getElementById('mobileLoginItem');
    const mobileSignup = document.getElementById('mobileSignupItem');

    if (user) {
        if (authButtons)  authButtons.style.display  = 'none';
        if (profileLink)  profileLink.style.display  = 'inline';
        if (logoutBtn)    logoutBtn.style.display     = 'inline-block';
        if (mobileLogin)  mobileLogin.style.display  = 'none';
        if (mobileSignup) mobileSignup.style.display = 'none';
    } else {
        if (authButtons)  authButtons.style.display  = 'flex';
        if (profileLink)  profileLink.style.display  = 'none';
        if (logoutBtn)    logoutBtn.style.display     = 'none';
        if (window.innerWidth <= 768) {
            if (mobileLogin)  mobileLogin.style.display  = 'list-item';
            if (mobileSignup) mobileSignup.style.display = 'list-item';
        }
    }
});

document.getElementById("logoutBtn")?.addEventListener("click", function () {
    firebase.auth().signOut().then(() => {
        window.location.href = "/index.html";
    });
});

document.querySelectorAll(".hero-btn, .grade-card a").forEach(btn => {
    btn.addEventListener("click", e => {
        if (!firebase.auth().currentUser) {
            e.preventDefault();
            alert("Please log in first to access lessons!");
            window.location.href = "/login/index.html";
        }
    });
});
