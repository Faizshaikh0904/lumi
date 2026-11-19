const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("lumiTasks")) || [];
let currentFilter = "all";

const today = new Date();
const todayString = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

document.getElementById("todayDate").textContent =
  today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

document.getElementById("taskDate").value = todayString;
document.getElementById("taskDate").min = todayString;

function saveTasks() {
  localStorage.setItem("lumiTasks", JSON.stringify(tasks));
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const remaining = total - completed;

  const percentage = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("remainingTasks").textContent = remaining;
  document.getElementById("progressText").textContent = percentage + "%";
  document.getElementById("progressBar").style.width = percentage + "%";
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = tasks.filter(task => {
    if (currentFilter === "today") {
      return task.date === todayString && !task.completed;
    }

    if (currentFilter === "upcoming") {
      return task.date > todayString && !task.completed;
    }

    if (currentFilter === "completed") {
      return task.completed;
    }

    return true;
  });

  filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }
    return a.date.localeCompare(b.date);
  });

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <div style="font-size:30px; margin-bottom:10px;">✦</div>
        No tasks here yet. Add something to get started!
      </div>
    `;
  }

  filteredTasks.forEach(task => {
    const card = document.createElement("article");
    card.className = `task-card ${task.completed ? "done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task as complete");
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("h3");
    title.textContent = task.title;

    const note = document.createElement("p");
    note.textContent = task.note || "No additional notes";

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const priority = document.createElement("span");
    priority.className = `priority ${task.priority}`;
    priority.textContent = task.priority;

    const date = document.createElement("span");
    date.className = "task-date";
    date.textContent = formatDate(task.date);

    meta.append(priority, date);
    content.append(title, note, meta);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete task");
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    card.append(checkbox, content, deleteButton);
    taskList.appendChild(card);
  });

  updateStats();
}

taskForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const title = document.getElementById("taskTitle").value.trim();
  const date = document.getElementById("taskDate").value;
  const priority = document.getElementById("taskPriority").value;
  const note = document.getElementById("taskNote").value.trim();

  if (!title || !date) return;

  const newTask = {
    id: Date.now(),
    title,
    date,
    priority,
    note,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  taskForm.reset();

  document.getElementById("taskDate").value = todayString;
  document.getElementById("taskPriority").value = "Medium";

  currentFilter = "all";
  document.querySelectorAll(".filter").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "all");
  });

  renderTasks();
});

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    renderTasks();
  });
});

renderTasks();
