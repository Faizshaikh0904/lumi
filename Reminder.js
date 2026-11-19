const form = document.getElementById("reminderForm");
const reminderList = document.getElementById("reminderList");

let reminders = JSON.parse(
    localStorage.getItem("lumiReminders") || "[]"
);

let currentFilter = "all";

function saveData() {
    localStorage.setItem(
        "lumiReminders",
        JSON.stringify(reminders)
    );
}

function getDateTime(reminder) {
    return new Date(`${reminder.date}T${reminder.time}`);
}

function updateStats() {

    const now = new Date();

    const completed = reminders.filter(
        task => task.completed
    ).length;

    const upcoming = reminders.filter(
        task => !task.completed &&
                getDateTime(task) >= now
    ).length;

    document.getElementById("totalCount").textContent =
        reminders.length;

    document.getElementById("completedCount").textContent =
        completed;

    document.getElementById("upcomingCount").textContent =
        upcoming;

    document.getElementById("taskCount").textContent =
        `${reminders.length} tasks`;
}

function renderReminders() {

    reminderList.innerHTML = "";

    const now = new Date();

    let filtered = reminders.filter(task => {

        if (currentFilter === "completed") {
            return task.completed;
        }

        if (currentFilter === "upcoming") {
            return !task.completed &&
                   getDateTime(task) >= now;
        }

        return true;
    });

    filtered.sort((a, b) =>
        getDateTime(a) - getDateTime(b)
    );

    if (filtered.length === 0) {

        reminderList.innerHTML =
            '<div class="empty">No reminders here yet. 💜</div>';

        updateStats();
        return;
    }

    filtered.forEach(task => {

        const item = document.createElement("div");

        item.className = "reminder-item";

        if (task.completed) {
            item.classList.add("done");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.style.width = "18px";
        checkbox.style.marginTop = "3px";

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveData();
            renderReminders();
        });

        const content = document.createElement("div");
        content.className = "reminder-content";

        const heading = document.createElement("h3");
        heading.textContent = task.title;

        const description = document.createElement("p");
        description.textContent =
            task.description || "No description added.";

        const dateText = document.createElement("p");
        dateText.className = "task-date";

        dateText.textContent =
            `${task.date} at ${task.time}`;

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete";
        deleteBtn.textContent = "Delete";

        deleteBtn.onclick = () => {

            reminders = reminders.filter(
                reminder => reminder.id !== task.id
            );

            saveData();
            renderReminders();
        };

        content.appendChild(heading);
        content.appendChild(description);
        content.appendChild(dateText);

        actions.appendChild(deleteBtn);

        item.appendChild(checkbox);
        item.appendChild(content);
        item.appendChild(actions);

        reminderList.appendChild(item);
    });

    updateStats();
}

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description =
        document.getElementById("description").value.trim();

    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (!title || !date || !time) return;

    const scheduled = new Date(`${date}T${time}`);

    if (scheduled < new Date()) {
        document.getElementById("message").textContent =
            "Please choose a future date and time.";
        return;
    }

    reminders.push({
        id: Date.now(),
        title,
        description,
        date,
        time,
        completed: false,
        notified: false
    });

    saveData();

    form.reset();

    document.getElementById("message").textContent =
        "Reminder saved successfully! 💜";

    renderReminders();
});

document.querySelectorAll(".filter").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".filter")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderReminders();
    });
});

document.getElementById("notificationBtn")
    .addEventListener("click", async () => {

        if (!("Notification" in window)) {
            alert("Notifications are not supported by this browser.");
            return;
        }

        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            alert("Browser notifications enabled!");
        } else {
            alert("Notification permission was not granted.");
        }
    });

function checkNotifications() {

    if (!("Notification" in window) ||
        Notification.permission !== "granted") return;

    const now = new Date();

    reminders.forEach(task => {

        if (task.completed || task.notified) return;

        const scheduled = getDateTime(task);

        if (scheduled <= now) {

            new Notification("LUMI Reminder", {
                body: task.title
            });

            task.notified = true;
            saveData();
        }
    });
}

document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

const dateInput = document.getElementById("date");

const today = new Date();
const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

dateInput.min = localToday;

renderReminders();

setInterval(checkNotifications, 15000);
checkNotifications();
