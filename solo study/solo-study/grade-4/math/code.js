// =====================
// SHOW / HIDE CONTENT
// =====================
function showContent(id) {
    document.querySelectorAll(".content-box").forEach(box => box.style.display = "none");
    let el = document.getElementById(id);
    if (el) el.style.display = "block";
}

// =====================
// XP SYSTEM
// =====================
let xp = parseInt(localStorage.getItem("xp")) || 0;

function updateXP() {
    let el = document.getElementById("xp-display");
    if (el) el.textContent = "XP: " + xp;
    calculateLevel();
}

function addXP(amount) {
    xp += amount;
    localStorage.setItem("xp", xp);
    updateXP();
}

// =====================
// CONFETTI 🎉
// =====================
function confetti() {
    for (let i = 0; i < 60; i++) {
        let d = document.createElement("div");
        d.style.position = "fixed";
        d.style.width = "10px";
        d.style.height = "10px";
        d.style.borderRadius = "2px";
        d.style.background = `hsl(${Math.random() * 360},80%,60%)`;
        d.style.left = Math.random() * 100 + "%";
        d.style.top = "-10px";
        d.style.zIndex = "9999";
        d.style.transition = "transform 1s linear";
        document.body.appendChild(d);
        let xMove = (Math.random() - 0.5) * 200;
        let yMove = window.innerHeight + 50;
        setTimeout(() => {
            d.style.transform = `translate(${xMove}px, ${yMove}px) rotate(${Math.random() * 720}deg)`;
            d.style.opacity = "0";
        }, 10);
        setTimeout(() => d.remove(), 1200);
    }
}

// =====================
// SHOW NUMBER BLOCKS
// =====================
function showNumber(container, num) {
    let h = container.querySelector(".hundreds");
    let t = container.querySelector(".tens");
    let o = container.querySelector(".ones");
    if (!h || !t || !o) return;
    h.innerHTML = t.innerHTML = o.innerHTML = "";
    let display = container.querySelector(".number");
    if (display) display.textContent = num;
    for (let i = 0; i < Math.floor(num / 100); i++) { let d = document.createElement("div"); d.className = "block hundred"; h.appendChild(d); }
    for (let i = 0; i < Math.floor((num % 100) / 10); i++) { let d = document.createElement("div"); d.className = "block ten"; t.appendChild(d); }
    for (let i = 0; i < num % 10; i++) { let d = document.createElement("div"); d.className = "block one"; o.appendChild(d); }
}

// =====================
// LOCAL UNIT PROGRESS
// =====================
let progress = JSON.parse(localStorage.getItem("progress")) || {
    lesson1: { completed: false, bestScore: 0, attempts: 0 },
    lesson2: { completed: false, bestScore: 0, attempts: 0 },
    lesson3: { completed: false, bestScore: 0, attempts: 0 },
    lesson4: { completed: false, bestScore: 0, attempts: 0 }
};

function saveProgress() {
    localStorage.setItem("progress", JSON.stringify(progress));
}

// =====================
// SYNC TO GLOBAL LESSONS
// =====================
function syncToGlobalLessons(lessonId, bestScore) {
    const lessonMap = { lesson1: 'place-value', lesson2: 'place-value', lesson3: 'place-value', lesson4: 'place-value' };
    const key = 'lesson-' + lessonMap[lessonId];
    let data = JSON.parse(localStorage.getItem(key)) || { exercises: 4, completed: 0 };
    data.completed = Math.max(data.completed, 1);
    localStorage.setItem(key, JSON.stringify(data));
}

// =====================
// UNIT PROGRESS UPDATE
// =====================
function updateProgress(){
    const done = Object.values(progress).filter(l => l.completed).length;
    const percent = Math.floor((done / 4) * 100);

    const bar = document.getElementById("progress-bar");
    const txt = document.getElementById("progress-text");
    if (bar) bar.style.width = percent + "%";
    if (txt) txt.textContent = `Progress: ${done} / 4`;

    // ✅ Sync to the lessons folder's localStorage key
    localStorage.setItem('lesson-place-value', JSON.stringify({ exercises: 4, completed: done }));

    calculateUnitAverage();
}

// =====================
// FINAL SCREEN (LOCKED AFTER 3 ATTEMPTS)
// =====================
function showFinal(container, bestScore, lesson) {
    container.querySelectorAll("input, button, .blocks, .current-question, .instruction")
        .forEach(el => el.style.display = "none");

    let result = container.querySelector(".result");
    let attemptsUsed = progress[lesson].attempts;
    let locked = attemptsUsed >= 3;

    if (locked) {
        result.innerHTML = `🔒 <strong>Exercise Locked</strong><br>Best Score: ${bestScore}%<br><small style="color:#888">All 3 attempts used.</small>`;
    } else {
        result.textContent = `🏆 Best Score: ${bestScore}%`;
        let attemptsLeft = 3 - attemptsUsed;
        let retry = document.createElement("button");
        retry.textContent = `Retry (${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} left)`;
        retry.style.marginTop = "10px";
        retry.onclick = () => {
            progress[lesson].completed = false;
            saveProgress();
            location.reload();
        };
        container.appendChild(retry);
    }
}

// =====================
// FINISH EXERCISE
// =====================
function finishExercise(lesson, score, total, container) {
    let percent = Math.floor(score / total * 100);
    let data = progress[lesson];

    if (data.attempts < 3) data.attempts++;
    if (percent > data.bestScore) data.bestScore = percent;

    // Complete if passed OR all attempts used
    if (data.bestScore >= 70 || data.attempts >= 3) {
        data.completed = true;
        addXP(data.bestScore >= 70 ? 50 : 20);
        if (data.bestScore >= 70) confetti();
        syncToGlobalLessons(lesson, data.bestScore);
    }

    saveProgress();
    updateProgress();

    if (data.completed) {
        showFinal(container, data.bestScore, lesson);
        return true;
    }

    // Show in-page message instead of alert
    let result = container.querySelector(".result");
    let attemptsLeft = 3 - data.attempts;
    result.textContent = `❌ Score: ${percent}% — Try again! (${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} left)`;
    result.style.color = "#e74c3c";
    return false;
}

// =====================
// GENERIC EXERCISE SETUP
// =====================
function setupExercise(id, lesson, gen) {
    let ex = document.getElementById(id);
    if (!ex) return;

    // If already locked, show locked state immediately
    if (progress[lesson].attempts >= 3) {
        let result = ex.querySelector(".result");
        if (result) {
            ex.querySelectorAll("input, button, .blocks, .current-question, .instruction")
                .forEach(el => el.style.display = "none");
            result.innerHTML = `🔒 <strong>Exercise Locked</strong><br>Best Score: ${progress[lesson].bestScore}%<br><small style="color:#888">All 3 attempts used.</small>`;
        }
        return;
    }

    let q = 1, total = 5, c = 0, current;
    let started = false;

    function next() {
        if (q > total) {
            if (!finishExercise(lesson, c, total, ex)) {
                q = 1; c = 0; setTimeout(next, 800);
            }
            return;
        }

        let d = gen();
        current = d.answer;

        ex.querySelector(".question-number").textContent = `Question ${q} / ${total}`;

        if (d.blocks) showNumber(ex, d.answer);
        else ex.querySelector(".current-question").textContent = d.question;

        ex.querySelector(".answer").value = "";
        ex.querySelector(".result").textContent = "";
        ex.querySelector(".result").style.color = "";
    }

    ex.querySelector(".check-btn").onclick = () => {
        if (!started) {
            started = true;
            next();
            return;
        }

        let val = parseFloat(ex.querySelector(".answer").value);

        if (val === current) {
            c++;
            ex.querySelector(".result").textContent = "✅ Correct!";
            ex.querySelector(".result").style.color = "green";
        } else {
            ex.querySelector(".result").textContent = `❌ Answer was ${current}`;
            ex.querySelector(".result").style.color = "#e74c3c";
        }

        q++;
        setTimeout(next, 700);
    };
}

// =====================
// UNIT & LEVEL CALCULATION
// =====================
function calculateUnitAverage() {
    let lessons = Object.values(progress);
    let done = lessons.filter(l => l.completed).length;
    let avg = (done / lessons.length) * 100;
    let el = document.getElementById("unit-score");
    if (el) el.textContent = Math.floor(avg) + "%";
    return Math.floor(avg);
}

function calculateLevel() {
    let level = Math.floor(xp / 100) + 1;
    let el = document.getElementById("level-display");
    if (el) el.textContent = `Level ${level}`;
}

// =====================
// INIT
// =====================
document.addEventListener("DOMContentLoaded", function () {

    // ===== FLASHCARDS =====
    const fc1 = document.getElementById("visual-flashcards-1");
    if (fc1) { fc1.querySelector(".next-btn").onclick = () => showNumber(fc1, Math.floor(Math.random() * 999) + 1); }

    const fc2 = document.getElementById("visual-flashcards-2");
    if (fc2) {
        const data = [{ w: "Six hundred forty-two", n: 642 }, { w: "Three hundred eighty-nine", n: 389 }, { w: "Two hundred seventy-six", n: 276 }];
        let i = 0;
        fc2.querySelector(".next-btn").onclick = () => {
            fc2.querySelector(".word-number").textContent = `${data[i].w} = ${data[i].n}`;
            i = (i + 1) % data.length;
        };
    }

    const fc3 = document.getElementById("visual-flashcards-3");
    if (fc3) {
        fc3.querySelector(".next-btn").onclick = () => {
            let n = Math.floor(Math.random() * 10);
            let m = [10, 100, 1000][Math.floor(Math.random() * 3)];
            fc3.querySelector(".flashcard-question").textContent = `${n} × ${m}`;
            fc3.querySelector(".flashcard-answer").textContent = `= ${n * m}`;
        };
    }

    const fc4 = document.getElementById("visual-flashcards-4");
    if (fc4) {
        const reveal = fc4.querySelector(".reveal-btn");
        fc4.querySelector(".next-btn").onclick = () => {
            let m = [10, 100, 1000][Math.floor(Math.random() * 3)];
            let n = m * Math.floor(Math.random() * 10);
            fc4.dataset.ans = n / m;
            fc4.querySelector(".flashcard-question").textContent = `${n} ÷ ${m}`;
            fc4.querySelector(".flashcard-answer").textContent = "";
        };
        reveal.onclick = () => { fc4.querySelector(".flashcard-answer").textContent = `= ${fc4.dataset.ans}`; };
    }

    // ===== EXERCISES =====
    setupExercise("Exercise-1", "lesson1", () => { let n = Math.floor(Math.random() * 999) + 1; return { question: n, answer: n, blocks: true }; });
    setupExercise("Exercise-2", "lesson2", () => {
        const data = [{ w: "Six hundred forty-two", n: 642 }, { w: "Three hundred eighty-nine", n: 389 }, { w: "Two hundred seventy-six", n: 276 }];
        const r = data[Math.floor(Math.random() * data.length)]; return { question: r.w, answer: r.n };
    });
    setupExercise("Exercise-3", "lesson3", () => {
        let n = Math.floor(Math.random() * 10); let m = [10, 100, 1000][Math.floor(Math.random() * 3)];
        return { question: `${n} × ${m}`, answer: n * m };
    });
    setupExercise("Exercise-4", "lesson4", () => {
        let m = [10, 100, 1000][Math.floor(Math.random() * 3)]; let n = m * Math.floor(Math.random() * 10);
        return { question: `${n} ÷ ${m}`, answer: n / m };
    });

    // ===== FINAL REVIEW =====
    const final = document.getElementById("final-review");
    if (final) {
        let q = 1, total = 20, correct = 0, current;

        function generateQuestion() {
            let type = Math.floor(Math.random() * 4);
            if (type === 0) { let n = Math.floor(Math.random() * 999) + 1; showNumber(final, n); return { question: "Type the number shown", answer: n, blocks: true }; }
            if (type === 1) { const data = [{ w: "Six hundred forty-two", n: 642 }, { w: "Three hundred eighty-nine", n: 389 }, { w: "Two hundred seventy-six", n: 276 }]; let r = data[Math.floor(Math.random() * data.length)]; return { question: r.w, answer: r.n }; }
            if (type === 2) { let n = Math.floor(Math.random() * 10); let m = [10, 100, 1000][Math.floor(Math.random() * 3)]; return { question: `${n} × ${m}`, answer: n * m }; }
            let m = [10, 100, 1000][Math.floor(Math.random() * 3)]; let n = m * Math.floor(Math.random() * 10); return { question: `${n} ÷ ${m}`, answer: n / m };
        }

        function next() {
            if (q > total) {
                let percent = Math.floor(correct / total * 100);
                if (percent >= 70) { addXP(100); confetti(); } else { addXP(30); }
                final.querySelectorAll("input, button, .current-question, .instruction, .blocks").forEach(el => el.style.display = "none");
                final.querySelector(".question-number").textContent = "🎓 Final Complete!";
                final.querySelector(".result").textContent = `🏆 Final Score: ${percent}%`;
                let retry = document.createElement("button");
                retry.textContent = "Retry Final";
                retry.style.marginTop = "10px";
                retry.onclick = () => {
                    q = 1; correct = 0;
                    final.querySelectorAll("input, .result, .current-question, .blocks").forEach(el => {
                        el.style.display = "block";
                        if (el.classList.contains("blocks")) el.innerHTML = "";
                        if (el.tagName === "INPUT") el.value = "";
                    });
                    next();
                };
                final.appendChild(retry);
                return;
            }
            let data = generateQuestion();
            current = data.answer;
            final.querySelector(".question-number").textContent = `Final Question ${q} / ${total}`;
            if (data.blocks) showNumber(final, data.answer);
            else final.querySelector(".current-question").textContent = data.question;
            final.querySelector(".answer").value = "";
            final.querySelector(".result").textContent = "";
            q++;
        }

        final.querySelector(".check-btn").onclick = () => {
            let val = parseFloat(final.querySelector(".answer").value);
            if (val === current) { correct++; final.querySelector(".result").textContent = "✅ Correct!"; }
            else { final.querySelector(".result").textContent = `❌ Answer was ${current}`; }
            setTimeout(next, 700);
        };

        next();
    }

    updateProgress();
    updateXP();
    showContent("visual-flashcards-1");
});