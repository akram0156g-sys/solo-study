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
// MARK EXERCISE COMPLETE
// =====================
function markExerciseComplete(lesson) {
    const exercisesCount = lessonsData[lesson]?.exercises || 5;
    let data = JSON.parse(localStorage.getItem('lesson-' + lesson)) || {
        exercises: exercisesCount,
        completed: 0
    };

    data.exercises = exercisesCount;

    if (data.completed < data.exercises) {
        data.completed++;
        localStorage.setItem('lesson-' + lesson, JSON.stringify(data));

        xp += 10;
        localStorage.setItem("xp", xp);
        updateXP();

        const percent = Math.floor((data.completed / data.exercises) * 100);

        if (percent === 100) {
            updateStreak();
            showToast(`✅ Lesson complete! +10 XP 🎉`);
        } else {
            showToast(`+10 XP! Progress: ${percent}%`);
        }

        updateAllProgressBars();
    } else {
        showToast(`✅ Already completed this lesson!`);
    }
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

    if (gradesSection) gradesSection.style.display = "block";
    if (grade4Section) grade4Section.style.display = "none";
    if (mathUnitsSection) mathUnitsSection.style.display = "none";

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (gradesSection) gradesSection.style.display = "none";
            if (grade4Section) grade4Section.style.display = "block";
            updateAllProgressBars();
        });
    }

    if (mathBtn) {
        mathBtn.addEventListener('click', () => {
            if (grade4Section) grade4Section.style.display = "none";
            if (mathUnitsSection) mathUnitsSection.style.display = "block";
            updateAllProgressBars();
        });
    }

    document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.grade-card');
            const lesson = card?.dataset.lesson;
            if (lesson) markExerciseComplete(lesson);
        });
    });

    updateAllProgressBars();
    updateXP();
});