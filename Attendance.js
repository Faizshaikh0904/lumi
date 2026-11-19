const daysContainer = document.getElementById("days");

let currentDate = new Date();
let selectedDate = null;

let attendance = JSON.parse(
    localStorage.getItem("attendance") || "{}"
);

function saveData() {
    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );
}

function getKey(year, month, day) {
    return `${year}-${month}-${day}`;
}

function renderCalendar() {

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById("month").innerText =
        currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric"
        });

    daysContainer.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();

    const totalDays = new Date(
        year, month + 1, 0
    ).getDate();

    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement("div");
        daysContainer.appendChild(blank);
    }

    for (let day = 1; day <= totalDays; day++) {

        const key = getKey(year, month, day);

        const status = attendance[key] || "";

        const button = document.createElement("button");

        button.className = "day";

        if (status) {
            button.classList.add(status);
        }

        if (selectedDate === key) {
            button.classList.add("selected");
        }

        button.innerHTML = `
            ${day}
            <small>${status}</small>
        `;

        button.onclick = function() {
            selectedDate = key;

            document.getElementById("selectedDate")
                .innerText =
                new Date(year, month, day)
                .toDateString();

            renderCalendar();
        };

        daysContainer.appendChild(button);
    }
}

function markAttendance(status) {

    if (!selectedDate) {
        alert("Please select a date first!");
        return;
    }

    if (status === "Clear") {
        delete attendance[selectedDate];
    } else {
        attendance[selectedDate] = status;
    }

    saveData();

    renderCalendar();
    updateStats();
}

function updateStats() {

    const values = Object.values(attendance);

    const present = values.filter(
        value => value === "Present"
    ).length;

    const absent = values.filter(
        value => value === "Absent"
    ).length;

    const total = present + absent;

    const percentage = total === 0
        ? 0
        : Math.round((present / total) * 100);

    document.getElementById("present").innerText = present;

    document.getElementById("absent").innerText = absent;

    document.getElementById("total").innerText = total;

    document.getElementById("percentage").innerText =
        percentage + "%";
}

document.getElementById("prev").onclick = function() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
};

document.getElementById("next").onclick = function() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
};

renderCalendar();
updateStats();
