let selectedMood = "";
let selectedEmoji = "";

let moodHistory = JSON.parse(
    localStorage.getItem("moodHistory") || "{}"
);

function getToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function selectMood(mood, emoji) {

    selectedMood = mood;
    selectedEmoji = emoji;

    document.getElementById("selectedMood").innerText =
        emoji + " You are feeling " + mood;

    document.querySelectorAll(".moods button")
        .forEach(button => button.classList.remove("active"));

    event.currentTarget.classList.add("active");
}

function saveMood() {

    if (!selectedMood) {
        alert("Please select your mood first!");
        return;
    }

    const thoughts = document.getElementById("thoughts").value;

    const today = getToday();

    moodHistory[today] = {
        mood: selectedMood,
        emoji: selectedEmoji,
        thoughts: thoughts
    };

    localStorage.setItem(
        "moodHistory",
        JSON.stringify(moodHistory)
    );

    document.getElementById("message").innerText =
        "Your mood has been saved successfully! 💜";

    renderHistory();
    renderSummary();
}

function renderHistory() {

    const historyList = document.getElementById("historyList");

    historyList.innerHTML = "";

    const dates = Object.keys(moodHistory).sort().reverse();

    if (dates.length === 0) {
        historyList.innerText = "No mood entries yet.";
        return;
    }

    dates.forEach(date => {

        const entry = moodHistory[date];

        const item = document.createElement("div");
        item.className = "history-item";

        const heading = document.createElement("h3");
        heading.textContent =
            `${entry.emoji} ${entry.mood} — ${date}`;

        const thought = document.createElement("p");
        thought.textContent =
            entry.thoughts || "No journal entry.";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete entry";

        deleteButton.onclick = () => {
            if (confirm("Delete this mood entry?")) {
                delete moodHistory[date];

                localStorage.setItem(
                    "moodHistory",
                    JSON.stringify(moodHistory)
                );

                renderHistory();
                renderSummary();
            }
        };

        item.appendChild(heading);
        item.appendChild(thought);
        item.appendChild(deleteButton);

        historyList.appendChild(item);
    });
}

function renderSummary() {

    const summary = document.getElementById("summary");

    const entries = Object.values(moodHistory);

    if (entries.length === 0) {
        summary.innerText = "No entries yet.";
        return;
    }

    const counts = {};

    entries.forEach(entry => {
        counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    });

    summary.innerHTML = "";

    Object.entries(counts).forEach(([mood, count]) => {

        const line = document.createElement("p");
        line.textContent = `${mood}: ${count} day(s)`;

        summary.appendChild(line);
    });

    const total = document.createElement("p");
    total.textContent = `Total check-ins: ${entries.length}`;

    summary.appendChild(total);
}

// Load previous entries when website opens

function loadToday() {

    const entry = moodHistory[getToday()];

    if (!entry) return;

    selectedMood = entry.mood;
    selectedEmoji = entry.emoji;

    document.getElementById("thoughts").value =
        entry.thoughts || "";

    document.getElementById("selectedMood").innerText =
        `${entry.emoji} You are feeling ${entry.mood}`;

    document.querySelectorAll(".moods button").forEach(button => {
        if (button.textContent.includes(entry.mood)) {
            button.classList.add("active");
        }
    });
}

renderHistory();
renderSummary();
loadToday();
