// Firebase SDK (loaded via script tags in HTML)
const firebaseConfig = {
    apiKey: "AIzaSyBeZaiuBiXxufhherNBFzvNSLYrQ2lk-tw",
    authDomain: "solo-study-fb0d5.firebaseapp.com",
    projectId: "solo-study-fb0d5",
    storageBucket: "solo-study-fb0d5.firebasestorage.app",
    messagingSenderId: "872460661235",
    appId: "1:872460661235:web:ce46cf405f80cf7e292286"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Save all user data from localStorage to Firestore
async function syncToFirestore() {
    const user = auth.currentUser;
    if (!user) return;

    const lessonKeys = ["place-value", "multiplication-fractions", "division-fractions", "fractions"];
    const lessons = {};
    for (const key of lessonKeys) {
        const data = localStorage.getItem("lesson-" + key);
        if (data) lessons[key] = JSON.parse(data);
    }

    await db.collection("users").doc(user.uid).update({
        xp: parseInt(localStorage.getItem("xp") || "0"),
        streakData: JSON.parse(localStorage.getItem("streakData") || '{"count":0,"lastDate":"","completedDates":[]}'),
        lessons: lessons
    });
}

// Load user data from Firestore into localStorage
async function loadFromFirestore(uid) {
    const doc = await db.collection("users").doc(uid).get();
    if (doc.exists) {
        const data = doc.data();
        localStorage.setItem("xp", data.xp || 0);
        localStorage.setItem("streakData", JSON.stringify(data.streakData || { count: 0, lastDate: "", completedDates: [] }));
        const lessons = data.lessons || {};
        for (const [key, value] of Object.entries(lessons)) {
            localStorage.setItem("lesson-" + key, JSON.stringify(value));
        }
        return data;
    }
    return null;
}
// ... your existing firebase-config.js code above ...

// Logout button (works on any page that has it)
document.getElementById("logoutBtn")?.addEventListener("click", async function () {
    await syncToFirestore();
    await auth.signOut();
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedInUser");
    window.location.href = "/index.html";
});