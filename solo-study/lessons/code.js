// =====================
// LESSONS CONFIG
// =====================
const lessonsData = {
    'place-value': { exercises: 4 },
    'multiplication-fractions': { exercises: 8 },
    'division-fractions': { exercises: 6 },
    'fractions': { exercises: 12 }
};

// =====================
// XP SYSTEM
// =====================
let xp = parseInt(localStorage.getItem("xp")) || 0;

function updateXP() {
    const el = document.getElementById("xp-display");
    if (el) el.textContent = xp;
    calculateLevel();
}

function calculateLevel() {
    const level = Math.floor(xp / 100) + 1;
    const el = document.getElementById("level-display");
    if (el) el.textContent = `Level ${level}`;
}

// =====================
// STREAK SYSTEM
// =====================
function updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    let streakData = JSON.parse(localStorage.getItem('streakData')) || {
        count: 0,
        lastDate: null,
        completedDates: []
    };

    if (streakData.completedDates.includes(today)) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streakData.lastDate === yesterdayStr) {
        streakData.count++;
    } else {
        streakData.count = 1;
    }

    streakData.lastDate = today;
    streakData.completedDates.push(today);
    localStorage.setItem('streakData', JSON.stringify(streakData));

    showToast(`🔥 Streak: ${streakData.count} day${streakData.count > 1 ? 's' : ''}!`);
}

// =====================
// TOAST NOTIFICATION
// =====================
function showToast(message) {
    let toast = document.getElementById('lesson-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'lesson-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #22c55e;
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            font-weight: bold;
            font-size: 15px;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: opacity 0.5s ease;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// =====================
// GET LESSON PERCENT
// =====================
function getLessonPercent(lessonKey) {
    const raw = localStorage.getItem('lesson-' + lessonKey);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    if (!data.exercises || data.exercises === 0) return 0;
    return Math.floor((data.completed / data.exercises) * 100);
}

// =====================
// UPDATE ALL PROGRESS BARS
// =====================
function updateAllProgressBars() {
    document.querySelectorAll('.grade-card[data-lesson]').forEach(card => {
        const lesson = card.dataset.lesson;
        const percent = getLessonPercent(lesson);
        const bar = card.querySelector('.progress');
        const txt = card.querySelector('.progress-text');
        if (bar) bar.style.width = percent + '%';
        if (txt) txt.textContent = percent + '%';
    });

    const mathPercent = calculateMathPercent();

    const mathCard = document.querySelector('.grade-card[data-subject="math"]');
    if (mathCard && !mathCard.dataset.lesson) {
        const bar = mathCard.querySelector('.progress');
        const txt = mathCard.querySelector('.progress-text');
        if (bar) bar.style.width = mathPercent + '%';
        if (txt) txt.textContent = mathPercent + '%';
    }

    const grade4Card = document.querySelector('.grade-card[data-subject="grade4"]');
    if (grade4Card) {
        const bar = grade4Card.querySelector('.progress');
        const txt = grade4Card.querySelector('.progress-text');
        if (bar) bar.style.width = mathPercent + '%';
        if (txt) txt.textContent = mathPercent + '%';
    }
}

// =====================
// CALCULATE MATH PERCENT
// =====================
function calculateMathPercent() {
    const units = Object.keys(lessonsData);
    const total = units.reduce((sum, key) => sum + getLessonPercent(key), 0);
    return Math.floor(total / units.length);
}

// =====================
// INIT
// =====================
document.addEventListener("DOMContentLoaded", function () {
    const gradesSection = document.querySelector('.grades');
    const grade4Section = document.querySelector('.grade-4-selection');
    const mathUnitsSection = document.querySelector('.grade-4-math-units');
    const startBtn = document.querySelector('.grade4-btn');
    const mathBtn = document.querySelector('.math-btn');
    const backBtn = document.getElementById('back-btn');

    let currentSection = 'grades';

    function showSection(section) {
        gradesSection.style.display = "none";
        grade4Section.style.display = "none";
        mathUnitsSection.style.display = "none";

        if (section === 'grades') {
            gradesSection.style.display = "block";
            backBtn.style.display = "none";
        } else if (section === 'grade4') {
            grade4Section.style.display = "block";
            backBtn.style.display = "inline-block";
        } else if (section === 'math') {
            mathUnitsSection.style.display = "block";
            backBtn.style.display = "inline-block";
        }

        currentSection = section;
        updateAllProgressBars();
    }

    showSection('grades');

    if (startBtn) {
        startBtn.addEventListener('click', () => showSection('grade4'));
    }

    if (mathBtn) {
        mathBtn.addEventListener('click', () => showSection('math'));
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (currentSection === 'math') showSection('grade4');
            else if (currentSection === 'grade4') showSection('grades');
            else window.location.href = '../index.html';
        });
    }

    // NOTE: No markExerciseComplete here — progress is tracked inside each lesson page

    updateAllProgressBars();
    updateXP();
});
// Show/hide logout button based on login state
function updateNavButtons() {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const logoutBtn = document.getElementById("logoutBtn");
    const getStartedBtn = document.querySelector(".nav-btn:not(.logout-btn)");
    const signInBtn = document.querySelector(".nav-sign-in");

    if (loggedIn) {
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (getStartedBtn) getStartedBtn.style.display = "none";
        if (signInBtn) signInBtn.style.display = "none";
    }
}

// Logout function
document.getElementById("logoutBtn")?.addEventListener("click", function () {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedInUser");
    window.location.href = "/index.html";
});

updateNavButtons();