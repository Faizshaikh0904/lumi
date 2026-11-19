const gameArea = document.getElementById("gameArea");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const bestElement = document.getElementById("best");
const startBtn = document.getElementById("startBtn");
const gameStatus = document.getElementById("gameStatus");

let score = 0;
let timeLeft = 30;
let gameRunning = false;
let timerInterval;
let spawnInterval;

let bestScore = Number(
    localStorage.getItem("lumiBest") || 0
);

bestElement.textContent = bestScore;

const colors = [
    "#DCCEFF",
    "#F8CDE4",
    "#C9E8F5",
    "#D4EEDC",
    "#FFE2BD",
    "#E9D9FF"
];

function createBubble() {

    if (!gameRunning) return;

    const bubble = document.createElement("button");

    bubble.className = "bubble";
    bubble.type = "button";
    bubble.setAttribute("aria-label", "Pop bubble");

    const size = Math.floor(Math.random() * 35) + 35;

    const maxX = Math.max(0, gameArea.clientWidth - size);
    const maxY = Math.max(0, gameArea.clientHeight - size);

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    bubble.style.width = size + "px";
    bubble.style.height = size + "px";
    bubble.style.left = x + "px";
    bubble.style.top = y + "px";

    bubble.style.background =
        colors[Math.floor(Math.random() * colors.length)];

    bubble.style.animationDelay =
        Math.random() + "s";

    bubble.addEventListener("click", () => {

        if (!gameRunning) return;

        score++;

        scoreElement.textContent = score;

        bubble.classList.add("pop");

        setTimeout(() => {
            bubble.remove();
        }, 180);

        createBubble();
    });

    gameArea.appendChild(bubble);
}

function startGame() {

    clearInterval(timerInterval);
    clearInterval(spawnInterval);

    score = 0;
    timeLeft = 30;
    gameRunning = true;

    scoreElement.textContent = score;
    timerElement.textContent = timeLeft;

    gameArea.innerHTML = "";

    startBtn.textContent = "Restart game ↻";
    gameStatus.textContent = "Game in progress...";

    for (let i = 0; i < 7; i++) {
        createBubble();
    }

    spawnInterval = setInterval(() => {
        if (gameRunning) {
            createBubble();
        }
    }, 700);

    timerInterval = setInterval(() => {

        timeLeft--;

        timerElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }

    }, 1000);
}

function endGame() {

    gameRunning = false;

    clearInterval(timerInterval);
    clearInterval(spawnInterval);

    gameArea.innerHTML = `
        <div class="welcome-message">
            <div class="big-bubble">🎉</div>
            <h2>Lovely work!</h2>
            <p>You popped ${score} bubbles. Great little break!</p>
        </div>
    `;

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem("lumiBest", bestScore);

        bestElement.textContent = bestScore;
    }

    gameStatus.textContent = "Game completed!";
    startBtn.textContent = "Play again →";
}

startBtn.addEventListener("click", startGame);
