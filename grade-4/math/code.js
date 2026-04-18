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
    const el = document.getElementById('xp-display');
    if (el) el.textContent = 'XP: ' + xp;
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

  function showSection(id) {
    document.querySelectorAll('.lesson-section').forEach(s => s.classList.add('hidden'));
    const el = document.getElementById(id);
    if (el) { el.classList.remove('hidden'); window.scrollTo(0,0); }
  }

  function showFinal() {
    setupFinalReview();
    showSection('final-review');
  }

  // ── Progress ───────────────────────────────────────────────────────────

  let progress = JSON.parse(localStorage.getItem('lesson-' + lessonName) || '{"xp":0,"done":0}');

  function updateProgress(num) {
    const key = 'ex' + num + 'done';
    if (!progress[key]) {
      progress[key] = true;
      progress.done = (progress.done || 0) + 1;
      progress.xp   = (progress.xp   || 0) + 25;
      localStorage.setItem('lesson-' + lessonName, JSON.stringify(progress));
    }
    if (progress.done >= 4) showFeedbackPopup();
  }

  function finishExercise(num) {
    confetti();
    addXP(25);
    updateProgress(num);
    const doneEl = document.getElementById('ex' + num + '-done');
    const qArea  = document.getElementById('ex' + num + '-area');
    if (qArea)  qArea.classList.add('hidden');
    if (doneEl) doneEl.classList.remove('hidden');
  }

  // ── Flashcard data ─────────────────────────────────────────────────────

  const flashcards = {
    1: [ // 3-digit × 1-digit
      {
        q: '214 × 3 = ?',
        steps: [
          '① Ones: 4 × 3 = 12 → write 2, carry 1',
          '② Tens: 1 × 3 = 3, + 1 carried = 4 → write 4',
          '③ Hundreds: 2 × 3 = 6 → write 6'
        ],
        a: '214 × 3 = <strong>642</strong> ✓'
      },
      {
        q: '135 × 4 = ?',
        steps: [
          '① Ones: 5 × 4 = 20 → write 0, carry 2',
          '② Tens: 3 × 4 = 12, + 2 carried = 14 → write 4, carry 1',
          '③ Hundreds: 1 × 4 = 4, + 1 carried = 5 → write 5'
        ],
        a: '135 × 4 = <strong>540</strong> ✓'
      },
      {
        q: '253 × 5 = ?',
        steps: [
          '① Ones: 3 × 5 = 15 → write 5, carry 1',
          '② Tens: 5 × 5 = 25, + 1 carried = 26 → write 6, carry 2',
          '③ Hundreds: 2 × 5 = 10, + 2 carried = 12 → write 12'
        ],
        a: '253 × 5 = <strong>1265</strong> ✓'
      },
      {
        q: '312 × 7 = ?',
        steps: [
          '① Ones: 2 × 7 = 14 → write 4, carry 1',
          '② Tens: 1 × 7 = 7, + 1 carried = 8 → write 8',
          '③ Hundreds: 3 × 7 = 21 → write 21'
        ],
        a: '312 × 7 = <strong>2184</strong> ✓'
      },
      {
        q: '426 × 8 = ?',
        steps: [
          '① Ones: 6 × 8 = 48 → write 8, carry 4',
          '② Tens: 2 × 8 = 16, + 4 carried = 20 → write 0, carry 2',
          '③ Hundreds: 4 × 8 = 32, + 2 carried = 34 → write 34'
        ],
        a: '426 × 8 = <strong>3408</strong> ✓'
      }
    ],
    2: [ // 2-digit × 2-digit
      {
        q: '12 × 11 = ?',
        steps: [
          '① Multiply by ones digit (1): 12 × 1 = 12',
          '② Multiply by tens digit (1): 12 × 10 = 120',
          '③ Add the two rows: 12 + 120 = 132'
        ],
        a: '12 × 11 = <strong>132</strong> ✓'
      },
      {
        q: '24 × 13 = ?',
        steps: [
          '① Multiply by ones digit (3): 24 × 3 = 72',
          '② Multiply by tens digit (1): 24 × 10 = 240',
          '③ Add the two rows: 72 + 240 = 312'
        ],
        a: '24 × 13 = <strong>312</strong> ✓'
      },
      {
        q: '35 × 21 = ?',
        steps: [
          '① Multiply by ones digit (1): 35 × 1 = 35',
          '② Multiply by tens digit (2): 35 × 20 = 700',
          '③ Add the two rows: 35 + 700 = 735'
        ],
        a: '35 × 21 = <strong>735</strong> ✓'
      },
      {
        q: '47 × 23 = ?',
        steps: [
          '① Multiply by ones digit (3): 47 × 3 = 141',
          '② Multiply by tens digit (2): 47 × 20 = 940',
          '③ Add the two rows: 141 + 940 = 1081'
        ],
        a: '47 × 23 = <strong>1081</strong> ✓'
      },
      {
        q: '56 × 34 = ?',
        steps: [
          '① Multiply by ones digit (4): 56 × 4 = 224',
          '② Multiply by tens digit (3): 56 × 30 = 1680',
          '③ Add the two rows: 224 + 1680 = 1904'
        ],
        a: '56 × 34 = <strong>1904</strong> ✓'
      }
    ],
    3: [ // Division – no remainder
      {
        q: '84 ÷ 4 = ?',
        steps: [
          '① How many 4s in 8? → 2. Write 2 above the tens',
          '② 2 × 4 = 8. Subtract: 8 − 8 = 0. Bring down 4',
          '③ How many 4s in 4? → 1. Write 1 above the ones'
        ],
        a: '84 ÷ 4 = <strong>21</strong> ✓'
      },
      {
        q: '126 ÷ 6 = ?',
        steps: [
          '① How many 6s in 12? → 2. Write 2 above the tens',
          '② 2 × 6 = 12. Subtract: 12 − 12 = 0. Bring down 6',
          '③ How many 6s in 6? → 1. Write 1 above the ones'
        ],
        a: '126 ÷ 6 = <strong>21</strong> ✓'
      },
      {
        q: '252 ÷ 7 = ?',
        steps: [
          '① How many 7s in 25? → 3 (3×7=21). Write 3 above tens',
          '② 3 × 7 = 21. Subtract: 25 − 21 = 4. Bring down 2 → 42',
          '③ How many 7s in 42? → 6 (6×7=42). Write 6 above ones'
        ],
        a: '252 ÷ 7 = <strong>36</strong> ✓'
      },
      {
        q: '504 ÷ 8 = ?',
        steps: [
          '① How many 8s in 50? → 6 (6×8=48). Write 6 above tens',
          '② 6 × 8 = 48. Subtract: 50 − 48 = 2. Bring down 4 → 24',
          '③ How many 8s in 24? → 3 (3×8=24). Write 3 above ones'
        ],
        a: '504 ÷ 8 = <strong>63</strong> ✓'
      },
      {
        q: '945 ÷ 9 = ?',
        steps: [
          '① How many 9s in 9? → 1. Write 1 above hundreds. Remainder 0. Bring down 4 → 04',
          '② How many 9s in 4? → 0. Write 0 above tens. Bring down 5 → 45',
          '③ How many 9s in 45? → 5 (5×9=45). Write 5 above ones'
        ],
        a: '945 ÷ 9 = <strong>105</strong> ✓'
      }
    ],
    4: [ // Division – with remainders
      {
        q: '17 ÷ 5 = ?',
        steps: [
          '① How many 5s fit in 17? → 3 (3 × 5 = 15)',
          '② Multiply: 3 × 5 = 15. Subtract: 17 − 15 = 2',
          '③ 2 is less than 5, so 2 is the remainder'
        ],
        a: '17 ÷ 5 = <strong>3 R 2</strong> ✓'
      },
      {
        q: '25 ÷ 4 = ?',
        steps: [
          '① How many 4s fit in 25? → 6 (6 × 4 = 24)',
          '② Multiply: 6 × 4 = 24. Subtract: 25 − 24 = 1',
          '③ 1 is less than 4, so 1 is the remainder'
        ],
        a: '25 ÷ 4 = <strong>6 R 1</strong> ✓'
      },
      {
        q: '47 ÷ 6 = ?',
        steps: [
          '① How many 6s fit in 47? → 7 (7 × 6 = 42)',
          '② Multiply: 7 × 6 = 42. Subtract: 47 − 42 = 5',
          '③ 5 is less than 6, so 5 is the remainder'
        ],
        a: '47 ÷ 6 = <strong>7 R 5</strong> ✓'
      },
      {
        q: '83 ÷ 9 = ?',
        steps: [
          '① How many 9s fit in 83? → 9 (9 × 9 = 81)',
          '② Multiply: 9 × 9 = 81. Subtract: 83 − 81 = 2',
          '③ 2 is less than 9, so 2 is the remainder'
        ],
        a: '83 ÷ 9 = <strong>9 R 2</strong> ✓'
      },
      {
        q: '100 ÷ 7 = ?',
        steps: [
          '① How many 7s in 10? → 1 (1×7=7). Remainder 3. Bring down 0 → 30',
          '② How many 7s in 30? → 4 (4×7=28). Remainder 2',
          '③ 2 is less than 7, so 2 is the remainder → quotient is 14'
        ],
        a: '100 ÷ 7 = <strong>14 R 2</strong> ✓'
      }
    ]
  };

  // ── Flashcard engine ───────────────────────────────────────────────────

  const fcState = { 1:{card:0,step:0}, 2:{card:0,step:0}, 3:{card:0,step:0}, 4:{card:0,step:0} };

  function loadCard(n) {
    const card = flashcards[n][fcState[n].card];
    fcState[n].step = 0;

    const qEl  = document.getElementById('fc' + n + '-question');
    const sEl  = document.getElementById('fc' + n + '-steps');
    const aEl  = document.getElementById('fc' + n + '-answer');
    const btn  = document.getElementById('fc' + n + '-btn');

    if (qEl) qEl.textContent = card.q;
    if (sEl) sEl.innerHTML = '';
    if (aEl) { aEl.innerHTML = ''; aEl.classList.add('hidden'); }
    if (btn) {
      btn.textContent = 'Next Step →';
      btn.style.background = '';
      btn.style.color = '';
    }
  }

  function fcStep(n) {
    const state = fcState[n];
    const card  = flashcards[n][state.card];
    const btn   = document.getElementById('fc' + n + '-btn');

    // "Next Card →" was clicked — load next card
    if (state.step >= card.steps.length) {
      state.card = (state.card + 1) % flashcards[n].length;
      loadCard(n);
      return;
    }

    // Reveal next step
    const sEl = document.getElementById('fc' + n + '-steps');
    if (sEl) {
      const div = document.createElement('div');
      div.className = 'fc-step';
      div.textContent = card.steps[state.step];
      sEl.appendChild(div);
    }
    state.step++;

    // All steps shown → reveal answer + flip button
    if (state.step >= card.steps.length) {
      const aEl = document.getElementById('fc' + n + '-answer');
      if (aEl) { aEl.innerHTML = card.a; aEl.classList.remove('hidden'); }
      if (btn) {
        btn.textContent = 'Next Card →';
        btn.style.background = '#2ecc71';
        btn.style.color = '#fff';
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

  const exGen   = { 1: genEx1, 2: genEx2, 3: genEx3, 4: genEx4 };
  const exCount = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const exScore = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const exTotal = 5;
  const currentQ = {};

  function setupExercise(num) {
    exCount[num] = 0;
    exScore[num] = 0;
    nextQuestion(num);
  }

  function nextQuestion(num) {
    exCount[num]++;
    currentQ[num] = exGen[num]();

    const qEl   = document.getElementById('ex' + num + '-question');
    const input = document.getElementById('ex' + num + '-answer');
    const fb    = document.getElementById('ex' + num + '-feedback');
    const prog  = document.getElementById('ex' + num + '-progress');
    const hint  = document.getElementById('ex' + num + '-hint');

    if (qEl)   qEl.textContent   = currentQ[num].q;
    if (input) { input.value = ''; input.focus(); }
    if (fb)    { fb.textContent = ''; fb.className = 'feedback'; }
    if (prog)  prog.textContent  = `Question ${exCount[num]} of ${exTotal}`;
    if (hint)  hint.textContent  = (num === 4) ? 'Write your answer as: Q R R  (e.g. 3 R 2)' : '';
  }

  function checkAnswer(num) {
    const input = document.getElementById('ex' + num + '-answer');
    const fb    = document.getElementById('ex' + num + '-feedback');
    if (!input) return;

    const raw  = input.value.trim();
    const prob = currentQ[num];
    let correct = false;

    if (num === 4) {
      // Accept flexible spacing: "3 R 2", "3R2", "3 r 2", etc.
      const norm = raw.toUpperCase().replace(/\s+/g, ' ').replace(/\bR\b/, 'R').trim();
      const exp  = String(prob.a).toUpperCase();
      correct = norm === exp;
    } else {
      correct = parseInt(raw, 10) === prob.a;
    }

    if (correct) {
      exScore[num]++;
      if (fb) { fb.textContent = '✓ Correct!'; fb.className = 'feedback correct'; }
    } else {
      if (fb) { fb.textContent = `✗ Not quite — answer was ${prob.a}`; fb.className = 'feedback incorrect'; }
    }

    const delay = correct ? 700 : 1400;
    setTimeout(() => {
      if (exCount[num] >= exTotal) finishExercise(num);
      else nextQuestion(num);
    }, delay);
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
    showFinalQuestion();
  }

  function showFinalQuestion() {
    const q     = finalQs[finalIdx];
    const qEl   = document.getElementById('final-question');
    const input = document.getElementById('answer');
    const fb    = document.getElementById('final-feedback');
    const prog  = document.getElementById('final-progress');
    const hint  = document.getElementById('final-hint');

    if (qEl)   qEl.textContent  = q.q;
    if (input) { input.value = ''; input.focus(); }
    if (fb)    { fb.textContent = ''; fb.className = 'feedback'; }
    if (prog)  prog.textContent = `Question ${finalIdx + 1} of ${finalQs.length}`;
    if (hint)  hint.textContent = (q.type === 4) ? 'Write your answer as: Q R R  (e.g. 3 R 2)' : '';
  }

  function checkFinal() {
    const input = document.getElementById('answer');
    const fb    = document.getElementById('final-feedback');
    if (!input) return;

    const raw = input.value.trim();
    const q   = finalQs[finalIdx];
    let correct = false;

    if (q.type === 4) {
      const norm = raw.toUpperCase().replace(/\s+/g, ' ').trim();
      correct = norm === String(q.a).toUpperCase();
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
        <div class="lesson-card" style="text-align:center">
          <h2>🏆 Unit Complete!</h2>
          <p>You scored <strong>${finalScore} / ${finalQs.length}</strong> (${pct}%)</p>
          <p>+50 XP earned! Keep it up! 🌟</p>
          <button onclick="showSection('lesson-hub')">← Back to Lessons</button>
        </div>`;
    }
    showFeedbackPopup();
  }

  // ── Feedback popup ─────────────────────────────────────────────────────

  function showFeedbackPopup() {
    const popup = document.getElementById('feedback-popup');
    if (popup) popup.classList.remove('hidden');
  }

  function feedbackYes() {
    document.getElementById('feedback-yes-section').classList.add('hidden');
    document.getElementById('feedback-thanks').classList.remove('hidden');
    saveFeedback(true, null, '');
  }

  function feedbackNo() {
    document.getElementById('feedback-yes-section').classList.add('hidden');
    document.getElementById('feedback-no-section').classList.remove('hidden');
  }

  function submitFeedback() {
    const reasons = {};
    ['tooHard','tooEasy','boring','confusing','other'].forEach(r => {
      const el = document.getElementById('reason-' + r);
      if (el && el.checked) reasons[r] = true;
    });
    const textEl    = document.getElementById('feedback-text');
    const otherText = textEl ? textEl.value.trim() : '';
    saveFeedback(false, reasons, otherText);
    document.getElementById('feedback-no-section').classList.add('hidden');
    document.getElementById('feedback-thanks').classList.remove('hidden');
  }

  function closeFeedback() {
    const popup = document.getElementById('feedback-popup');
    if (popup) popup.classList.add('hidden');
  }

  function saveFeedback(liked, reasons, otherText) {
    if (typeof db === 'undefined') return;
    const ref = db.collection('feedback').doc(lessonName);
    ref.get().then(doc => {
      const defaults = { totalYes:0, totalNo:0,
        reasons:{ tooHard:0, tooEasy:0, boring:0, confusing:0, other:0 },
        otherResponses:[] };
      const data = doc.exists ? doc.data() : defaults;

      // Ensure sub-objects exist (defensive)
      if (!data.reasons)        data.reasons = defaults.reasons;
      if (!data.otherResponses) data.otherResponses = [];

      if (liked) {
        data.totalYes++;
      } else {
        data.totalNo++;
        if (reasons) {
          Object.keys(reasons).forEach(r => {
            if (r in data.reasons) data.reasons[r]++;
          });
        }
        if (otherText) data.otherResponses.push(otherText);
      }
      ref.set(data);
    });
  }

  // ── Expose to HTML onclick handlers ───────────────────────────────────

  window.fcStep          = fcStep;
  window.showSection     = showSection;
  window.showFinal       = showFinal;
  window.setupExercise   = setupExercise;
  window.checkAnswer     = checkAnswer;
  window.checkFinal      = checkFinal;
  window.feedbackYes     = feedbackYes;
  window.feedbackNo      = feedbackNo;
  window.submitFeedback  = submitFeedback;
  window.closeFeedback   = closeFeedback;

  // ── Init: load first card for each flashcard set ───────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    for (let n = 1; n <= 4; n++) loadCard(n);
  });

} // end Unit 2 guard
// ============================================================
