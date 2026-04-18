// =====================
// SHOW / HIDE CONTENT
// =====================
function showContent(id) {
    document.querySelectorAll(".content-box").forEach(box => box.style.display = "none");
    let el = document.getElementById(id);
    if (el) el.style.display = "block";
}

// =====================
// NUMBER TO WORDS
// =====================
function numberToWords(n) {
    const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
                  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
                  "seventeen", "eighteen", "nineteen"];
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    if (n === 0) return "Zero";
    let result = "";
    if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " hundred";
        n = n % 100;
        if (n > 0) result += " ";
    }
    if (n >= 20) {
        result += tens[Math.floor(n / 10)];
        if (n % 10 > 0) result += "-" + ones[n % 10];
    } else if (n > 0) {
        result += ones[n];
    }
    return result.charAt(0).toUpperCase() + result.slice(1);
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
// UNIT PROGRESS UPDATE
// =====================
function updateProgress() {
    const done = Object.values(progress).filter(l => l.completed).length;
    const percent = Math.floor((done / 4) * 100);

    const bar = document.getElementById("progress-bar");
    const txt = document.getElementById("progress-text");
    if (bar) bar.style.width = percent + "%";
    if (txt) txt.textContent = `Progress: ${done} / 4`;

    if (done === 4) showFeedbackPopup();

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

    if (data.bestScore >= 70 || data.attempts >= 3) {
        data.completed = true;
        addXP(data.bestScore >= 70 ? 50 : 20);
        if (data.bestScore >= 70) confetti();
    }

    saveProgress();
    updateProgress();

    if (data.completed) {
        showFinal(container, data.bestScore, lesson);
        return true;
    }

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
// FEEDBACK POPUP
// =====================
const lessonName = 'place-value';
let selectedReasons = {};

function showFeedbackPopup() {
    if (sessionStorage.getItem('feedbackShown-' + lessonName)) return;
    sessionStorage.setItem('feedbackShown-' + lessonName, 'true');

    const overlay = document.getElementById('feedbackOverlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    document.getElementById('feedbackStep1').style.display = 'block';
    document.getElementById('feedbackStep2').style.display = 'none';
    document.getElementById('feedbackStep3').style.display = 'none';
    selectedReasons = {};
}

function closeFeedback() {
    document.getElementById('feedbackOverlay').style.display = 'none';
}

function feedbackNo() {
    document.getElementById('feedbackStep1').style.display = 'none';
    document.getElementById('feedbackStep2').style.display = 'block';
}

function toggleReason(btn, reason) {
    if (selectedReasons[reason]) {
        delete selectedReasons[reason];
        btn.style.borderColor = 'transparent';
        btn.style.background = '#2d3f55';
    } else {
        selectedReasons[reason] = true;
        btn.style.borderColor = '#22c55e';
        btn.style.background = '#1a3a2a';
    }
    const otherText = document.getElementById('otherText');
    if (reason === 'other') {
        otherText.style.display = selectedReasons['other'] ? 'block' : 'none';
    }
}

async function feedbackYes() {
    document.getElementById('feedbackStep1').style.display = 'none';
    document.getElementById('feedbackThanksMsg').textContent = 'Great! Glad you enjoyed it! 🎉';
    document.getElementById('feedbackStep3').style.display = 'block';

    try {
        const ref = db.collection('feedback').doc(lessonName);
        const snap = await ref.get();
        const data = snap.exists ? snap.data() : {};
        await ref.set({ totalYes: (data.totalYes || 0) + 1 }, { merge: true });
    } catch (e) {
        console.warn('Feedback save failed:', e);
    }
}

async function submitFeedbackNo() {
    const otherText = document.getElementById('otherText').value.trim();

    try {
        const ref = db.collection('feedback').doc(lessonName);
        const snap = await ref.get();
        const data = snap.exists ? snap.data() : {};
        const reasons = data.reasons || {};

        const updateData = {
            totalNo: (data.totalNo || 0) + 1,
            reasons: {
                tooHard:   (reasons.tooHard   || 0) + (selectedReasons.tooHard   ? 1 : 0),
                tooEasy:   (reasons.tooEasy   || 0) + (selectedReasons.tooEasy   ? 1 : 0),
                boring:    (reasons.boring    || 0) + (selectedReasons.boring    ? 1 : 0),
                confusing: (reasons.confusing || 0) + (selectedReasons.confusing ? 1 : 0),
                other:     (reasons.other     || 0) + (selectedReasons.other     ? 1 : 0),
            }
        };

        if (otherText) {
            updateData.otherResponses = [...(data.otherResponses || []), otherText];
        }

        await ref.set(updateData, { merge: true });
    } catch (e) {
        console.warn('Feedback save failed:', e);
    }

    document.getElementById('feedbackStep2').style.display = 'none';
    document.getElementById('feedbackThanksMsg').textContent = "Thanks for the feedback! We'll make it better. 💪";
    document.getElementById('feedbackStep3').style.display = 'block';
}

// =====================
// RANDOM WORD-NUMBER GENERATOR
// =====================
function randomWordQuestion() {
    let n = Math.floor(Math.random() * 899) + 100; // 100–998, always 3 digits
    return { question: numberToWords(n), answer: n };
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
        fc2.querySelector(".next-btn").onclick = () => {
            let n = Math.floor(Math.random() * 899) + 100;
            fc2.querySelector(".word-number").textContent = `${numberToWords(n)} = ${n}`;
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
    setupExercise("Exercise-2", "lesson2", () => randomWordQuestion());
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
            if (type === 1) { return randomWordQuestion(); }
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



// ============================================================
//  UNIT 2: MULTIPLICATION & DIVISION
// ============================================================
if (window.location.pathname.includes('multiplication-division')) {

  const lessonName = 'multiplication-division';

  // ── Helpers ────────────────────────────────────────────────────────────

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function addXP(amount) {
    let xp = parseInt(localStorage.getItem('xp') || '0') + amount;
    localStorage.setItem('xp', xp);
    const el = document.getElementById('xp-count');
    if (el) el.textContent = xp;
  }

  function confetti() {
    const colors = ['#ff595e','#ffca3a','#6a4c93','#1982c4','#8ac926'];
    for (let i = 0; i < 60; i++) {
      const d = document.createElement('div');
      d.style.cssText = `position:fixed;top:-10px;left:${Math.random()*100}vw;
        width:8px;height:8px;background:${colors[i%colors.length]};
        border-radius:50%;z-index:9999;
        animation:fall ${1+Math.random()*2}s linear forwards`;
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 3000);
    }
  }

  // ── showSection: matches your HTML content-box IDs ────────────────────
  function showSection(id) {
    document.querySelectorAll('.content-box').forEach(s => s.classList.add('hidden'));
    const el = document.getElementById(id);
    if (el) { el.classList.remove('hidden'); window.scrollTo(0, 0); }
  }

  function showFinal() {
    if (completedCount() < 4) {
      alert('Complete all 4 exercises first to unlock the Final Review!');
      return;
    }
    setupFinalReview();
    showSection('final-review');
  }

  // ── Progress ───────────────────────────────────────────────────────────

  let progress = JSON.parse(localStorage.getItem('lesson-' + lessonName) || '{"xp":0,"done":0}');

  function completedCount() {
    let count = 0;
    for (let i = 1; i <= 4; i++) { if (progress['ex' + i + 'done']) count++; }
    return count;
  }

  function updateProgress(num) {
    const key = 'ex' + num + 'done';
    if (!progress[key]) {
      progress[key] = true;
      progress.done = completedCount();
      progress.xp   = (progress.xp || 0) + 25;
      localStorage.setItem('lesson-' + lessonName, JSON.stringify(progress));
    }
    updateDashboard();
    if (completedCount() >= 4) showFeedbackPopup();
  }

  function updateDashboard() {
    const done  = completedCount();
    const xp    = parseInt(localStorage.getItem('xp') || '0');
    const level = Math.floor(xp / 100) + 1;
    const score = progress.xp || 0;

    const xpEl    = document.getElementById('xp-count');
    const lvlEl   = document.getElementById('level-count');
    const scoreEl = document.getElementById('score-count');
    const fillEl  = document.getElementById('progress-fill');
    const labelEl = document.getElementById('progress-label');

    if (xpEl)    xpEl.textContent    = xp;
    if (lvlEl)   lvlEl.textContent   = level;
    if (scoreEl) scoreEl.textContent = score;
    if (fillEl)  fillEl.style.width  = (done / 4 * 100) + '%';
    if (labelEl) labelEl.textContent = done + ' / 4 complete';
  }

  function finishExercise(num) {
    confetti();
    addXP(25);
    updateProgress(num);
    // Show a done message inside the exercise box
    const exDiv = document.getElementById('exercise-' + num);
    if (exDiv) {
      exDiv.innerHTML = `
        <div style="text-align:center;padding:1.5rem 0;">
          <p style="font-size:1.3rem;font-weight:800;color:#27ae60;">🎉 Exercise ${num} Complete!</p>
          <p style="color:#555;margin-top:0.5rem;">+25 XP earned!</p>
        </div>`;
    }
  }

  // ── Flashcard engine ───────────────────────────────────────────────────
  // Your HTML uses static fc-step divs with class "hidden" — we reveal them one by one

  const fcState = {
    1: { card: 0, step: 0 },
    2: { card: 0, step: 0 },
    3: { card: 0, step: 0 },
    4: { card: 0, step: 0 }
  };

  function getSlides(n) {
    return document.querySelectorAll(`#fc${n}-container .flashcard-slide`);
  }

  function loadCard(n) {
    const slides = getSlides(n);
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === 0);
      // Reset all steps to hidden
      slide.querySelectorAll('.fc-step').forEach(s => s.classList.add('hidden'));
    });
    fcState[n].card = 0;
    fcState[n].step = 0;

    const btn = document.getElementById('fc' + n + '-btn');
    if (btn) {
      btn.textContent = 'Next Step →';
      btn.className = 'fc-step-btn';
    }
    updateFcCounter(n);
  }

  function updateFcCounter(n) {
    const slides  = getSlides(n);
    const counter = document.getElementById('fc' + n + '-counter');
    if (counter) counter.textContent = `Card ${fcState[n].card + 1} of ${slides.length}`;
  }

  function fcStep(n) {
    const slides      = getSlides(n);
    const state       = fcState[n];
    const activeSlide = slides[state.card];
    if (!activeSlide) return;

    const steps   = activeSlide.querySelectorAll('.fc-step:not(.fc-answer)');
    const answer  = activeSlide.querySelector('.fc-answer');
    const btn     = document.getElementById('fc' + n + '-btn');

    // If answer already shown → go to next card
    if (answer && !answer.classList.contains('hidden')) {
      // Move to next card
      state.card = (state.card + 1) % slides.length;
      state.step = 0;

      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === state.card);
        slide.querySelectorAll('.fc-step').forEach(s => s.classList.add('hidden'));
      });

      if (btn) {
        btn.textContent = 'Next Step →';
        btn.className = 'fc-step-btn';
      }
      updateFcCounter(n);
      return;
    }

    // Reveal next step
    if (state.step < steps.length) {
      steps[state.step].classList.remove('hidden');
      state.step++;
    }

    // All steps shown → reveal answer
    if (state.step >= steps.length) {
      if (answer) answer.classList.remove('hidden');
      if (btn) {
        btn.textContent = 'Next Card →';
        btn.className = 'fc-step-btn done-btn';
      }
    }
  }

  // ── Exercise question generators ───────────────────────────────────────

  function genEx1() {
    const a = rand(100, 999), b = rand(2, 9);
    return { q: `${a} × ${b} = ?`, a: a * b, type: 1 };
  }

  function genEx2() {
    const a = rand(11, 99), b = rand(11, 99);
    return { q: `${a} × ${b} = ?`, a: a * b, type: 2 };
  }

  function genEx3() {
    const divisor  = rand(2, 9);
    const quotient = rand(11, 99);
    return { q: `${divisor * quotient} ÷ ${divisor} = ?`, a: quotient, type: 3 };
  }

  function genEx4() {
    const divisor   = rand(3, 9);
    const quotient  = rand(5, 20);
    const remainder = rand(1, divisor - 1);
    const dividend  = divisor * quotient + remainder;
    return { q: `${dividend} ÷ ${divisor} = ?`, a: `${quotient} R ${remainder}`, type: 4 };
  }

  // ── Exercise state ─────────────────────────────────────────────────────
  // Your HTML uses: #exercise-1 > .question, input, .check-btn, .feedback, .dots

  const exGen    = { 1: genEx1, 2: genEx2, 3: genEx3, 4: genEx4 };
  const exCount  = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const exAttempts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const exTotal  = 5;
  const maxAttempts = 3;
  const currentQ = {};

  function setupExercise(num) {
    exCount[num]  = 0;
    exAttempts[num] = 0;
    nextQuestion(num);
  }

  function getExEl(num, selector) {
    const container = document.getElementById('exercise-' + num);
    return container ? container.querySelector(selector) : null;
  }

  function nextQuestion(num) {
    exCount[num]++;
    exAttempts[num] = 0;
    currentQ[num]   = exGen[num]();

    const qEl   = getExEl(num, '.question');
    const input = getExEl(num, 'input');
    const fb    = getExEl(num, '.feedback');
    const dots  = getExEl(num, '.dots');

    if (qEl)   qEl.textContent  = currentQ[num].q;
    if (input) { input.value = ''; input.focus(); }
    if (fb)    { fb.textContent = ''; fb.className = 'feedback'; }
    if (dots)  renderDots(dots, 0);
  }

  function renderDots(dotsEl, used) {
    dotsEl.innerHTML = '';
    for (let i = 0; i < maxAttempts; i++) {
      const dot = document.createElement('span');
      dot.style.cssText = `display:inline-block;width:12px;height:12px;border-radius:50%;
        margin:0 3px;background:${i < used ? '#e74c3c' : '#c0b0e0'};`;
      dotsEl.appendChild(dot);
    }
  }

  function checkAnswer(num) {
    const input = getExEl(num, 'input');
    const fb    = getExEl(num, '.feedback');
    const dots  = getExEl(num, '.dots');
    if (!input) return;

    const raw  = input.value.trim();
    const prob = currentQ[num];
    let correct = false;

    if (num === 4) {
      const norm = raw.toUpperCase().replace(/\s+/g, ' ').trim();
      const exp  = String(prob.a).toUpperCase();
      correct    = norm === exp;
    } else {
      correct = parseInt(raw, 10) === prob.a;
    }

    exAttempts[num]++;
    if (dots) renderDots(dots, exAttempts[num]);

    if (correct) {
      if (fb) { fb.textContent = '✓ Correct!'; fb.className = 'feedback correct'; }
      const delay = 700;
      setTimeout(() => {
        if (exCount[num] >= exTotal) finishExercise(num);
        else nextQuestion(num);
      }, delay);
    } else if (exAttempts[num] >= maxAttempts) {
      if (fb) { fb.textContent = `✗ The answer was ${prob.a}`; fb.className = 'feedback incorrect'; }
      setTimeout(() => {
        if (exCount[num] >= exTotal) finishExercise(num);
        else nextQuestion(num);
      }, 1800);
    } else {
      if (fb) { fb.textContent = `✗ Try again! (${maxAttempts - exAttempts[num]} left)`; fb.className = 'feedback incorrect'; }
      input.value = '';
      input.focus();
    }
  }

  // Wire up check buttons via event delegation
  function initExerciseButtons() {
    for (let num = 1; num <= 4; num++) {
      const container = document.getElementById('exercise-' + num);
      if (!container) continue;
      const btn   = container.querySelector('.check-btn');
      const input = container.querySelector('input');
      if (btn)   btn.addEventListener('click',   () => checkAnswer(num));
      if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') checkAnswer(num); });
    }
  }

  // ── Final Review ───────────────────────────────────────────────────────

  let finalQs = [], finalIdx = 0, finalScore = 0;

  function setupFinalReview() {
    finalQs = []; finalIdx = 0; finalScore = 0;
    for (let i = 0; i < 5; i++) finalQs.push(genEx1());
    for (let i = 0; i < 5; i++) finalQs.push(genEx2());
    for (let i = 0; i < 5; i++) finalQs.push(genEx3());
    for (let i = 0; i < 5; i++) finalQs.push(genEx4());
    // Shuffle
    for (let i = finalQs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalQs[i], finalQs[j]] = [finalQs[j], finalQs[i]];
    }
    // Wire up check button
    const checkBtn = document.getElementById('check-btn');
    const ansInput = document.getElementById('answer');
    if (checkBtn) checkBtn.onclick = checkFinal;
    if (ansInput) ansInput.onkeydown = e => { if (e.key === 'Enter') checkFinal(); };
    showFinalQuestion();
  }

  function showFinalQuestion() {
    const q     = finalQs[finalIdx];
    const qEl   = document.getElementById('current-question');
    const input = document.getElementById('answer');
    const fb    = document.getElementById('review-feedback');
    const prog  = document.getElementById('review-progress');

    if (qEl)   qEl.textContent  = q.q;
    if (input) { input.value = ''; input.focus(); }
    if (fb)    { fb.textContent = ''; fb.className = 'feedback'; }
    if (prog)  prog.textContent = `Question ${finalIdx + 1} of ${finalQs.length}`;

    // Show hint for remainder questions
    const hint = document.getElementById('answer');
    if (input) input.placeholder = (q.type === 4) ? 'e.g. 14 R 2' : 'Your answer';
  }

  function checkFinal() {
    const input = document.getElementById('answer');
    const fb    = document.getElementById('review-feedback');
    if (!input) return;

    const raw = input.value.trim();
    const q   = finalQs[finalIdx];
    let correct = false;

    if (q.type === 4) {
      const norm = raw.toUpperCase().replace(/\s+/g, ' ').trim();
      correct    = norm === String(q.a).toUpperCase();
    } else {
      correct = parseInt(raw, 10) === q.a;
    }

    if (correct) {
      finalScore++;
      if (fb) { fb.textContent = '✓ Correct!'; fb.className = 'feedback correct'; }
    } else {
      if (fb) { fb.textContent = `✗ Answer: ${q.a}`; fb.className = 'feedback incorrect'; }
    }

    finalIdx++;
    const delay = correct ? 700 : 1400;
    if (finalIdx >= finalQs.length) setTimeout(endFinalReview, delay);
    else setTimeout(showFinalQuestion, delay);
  }

  function endFinalReview() {
    const pct = Math.round((finalScore / finalQs.length) * 100);
    confetti();
    addXP(50);
    const section = document.getElementById('final-review');
    if (section) {
      section.innerHTML = `
        <div style="text-align:center;padding:2rem;">
          <h2 style="font-size:2rem;margin-bottom:1rem;">🏆 Unit Complete!</h2>
          <p style="font-size:1.2rem;">You scored <strong>${finalScore} / ${finalQs.length}</strong> (${pct}%)</p>
          <p style="color:#6a4c93;margin-top:0.5rem;font-weight:600;">+50 XP earned! Keep it up! 🌟</p>
        </div>`;
    }
    showFeedbackPopup();
  }

  // ── Feedback popup ─────────────────────────────────────────────────────
  // Matches your HTML: #feedback-overlay, #feedback-step1/2/3

  function showFeedbackPopup() {
    const overlay = document.getElementById('feedback-overlay');
    if (overlay) overlay.classList.remove('hidden');
    // Reset to step 1
    document.getElementById('feedback-step1').classList.remove('hidden');
    document.getElementById('feedback-step2').classList.add('hidden');
    document.getElementById('feedback-step3').classList.add('hidden');
  }

  function feedbackYes() {
    saveFeedback(true, null, '');
    document.getElementById('feedback-step1').classList.add('hidden');
    document.getElementById('feedback-step3').classList.remove('hidden');
  }

  function feedbackNo() {
    document.getElementById('feedback-step1').classList.add('hidden');
    document.getElementById('feedback-step2').classList.remove('hidden');
  }

  function submitFeedback() {
    const reasons = {};
    ['tooHard','tooEasy','boring','confusing','other'].forEach(r => {
      const el = document.querySelector(`.reason-checkboxes input[value="${r}"]`);
      if (el && el.checked) reasons[r] = true;
    });
    const textEl    = document.getElementById('other-text');
    const otherText = textEl ? textEl.value.trim() : '';
    saveFeedback(false, reasons, otherText);
    document.getElementById('feedback-step2').classList.add('hidden');
    document.getElementById('feedback-step3').classList.remove('hidden');
  }

  function closeFeedback() {
    const overlay = document.getElementById('feedback-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  function saveFeedback(liked, reasons, otherText) {
    if (typeof db === 'undefined') return;
    const ref = db.collection('feedback').doc(lessonName);
    ref.get().then(doc => {
      const defaults = { totalYes: 0, totalNo: 0,
        reasons: { tooHard: 0, tooEasy: 0, boring: 0, confusing: 0, other: 0 },
        otherResponses: [] };
      const data = doc.exists ? doc.data() : defaults;
      if (!data.reasons)        data.reasons = defaults.reasons;
      if (!data.otherResponses) data.otherResponses = [];

      if (liked) {
        data.totalYes++;
      } else {
        data.totalNo++;
        if (reasons) Object.keys(reasons).forEach(r => { if (r in data.reasons) data.reasons[r]++; });
        if (otherText) data.otherResponses.push(otherText);
      }
      ref.set(data);
    });
  }

  // ── Expose to HTML onclick handlers ───────────────────────────────────

  window.fcStep         = fcStep;
  window.showSection    = showSection;
  window.showFinal      = showFinal;
  window.setupExercise  = setupExercise;
  window.checkAnswer    = checkAnswer;
  window.checkFinal     = checkFinal;
  window.feedbackYes    = feedbackYes;
  window.feedbackNo     = feedbackNo;
  window.submitFeedback = submitFeedback;
  window.closeFeedback  = closeFeedback;

  // ── Init ───────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    for (let n = 1; n <= 4; n++) {
      setupExercise(n);
      loadCard(n);
    }
    initExerciseButtons();
  });

} // end Unit 2 guard
