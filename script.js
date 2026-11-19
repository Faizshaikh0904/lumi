// Display today's date

const today = new Date();

document.getElementById("today").textContent =
    today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });


// Task management

let tasks = JSON.parse(localStorage.getItem("lumiTasks")) || [];

const taskInput = document.getElementById("taskInput");
const subject = document.getElementById("subject");
const taskList = document.getElementById("taskList");

function saveTasks() {
    localStorage.setItem("lumiTasks", JSON.stringify(tasks));
}

function renderTasks() {

    taskList.innerHTML = "";

    tasks.forEach((task, index) => {

        const item = document.createElement("div");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const info = document.createElement("div");
        info.className = "task-info";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            tasks[index].completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const details = document.createElement("div");

        const name = document.createElement("div");
        name.className = "task-name";
        name.textContent = task.name;

        const category = document.createElement("div");
        category.className = "task-subject";
        category.textContent = task.subject;

        details.append(name, category);
        info.append(checkbox, details);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "✕";

        deleteButton.addEventListener("click", () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        item.append(info, deleteButton);
        taskList.appendChild(item);
    });

    updateStats();
}


// Add new task

document.getElementById("addTask").addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});

function addTask() {

    const name = taskInput.value.trim();

    if (name === "") {
        alert("Please enter a study task!");
        return;
    }

    tasks.push({
        name: name,
        subject: subject.value,
        completed: false
    });

    taskInput.value = "";

    saveTasks();
    renderTasks();
}


// Progress calculation

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("totalTasks").textContent = total;

    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("progress").textContent =
        percentage + "%";
}


// Focus timer

let timeLeft = 25 * 60;
let timerInterval = null;

const timerDisplay = document.getElementById("timerDisplay");

function updateTimerDisplay() {

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}

document.getElementById("startTimer").addEventListener("click", () => {

    if (timerInterval !== null) return;

    timerInterval = setInterval(() => {

        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            alert("Focus session completed! Take a break ✨");
        }

    }, 1000);
});

document.getElementById("resetTimer").addEventListener("click", () => {

    clearInterval(timerInterval);
    timerInterval = null;

    timeLeft = 25 * 60;
    updateTimerDisplay();
});


// Initial rendering

renderTasks();
updateTimerDisplay();
