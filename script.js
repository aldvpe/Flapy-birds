// Masukkan URL Deployment Google Apps Script Anda di sini
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwPQW-vBQuwybWz3nrDvLSGvVbGit1zh7XWjLAEpms_5DmhgC3YbnfHAoUs6OtIYGQO/exec";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let username = "";
let noWA = "";
let score = 0;
let gameOver = false;
let gameStarted = false;
let frame = 0;

// Objek Burung
const bird = {
    x: 60,
    y: 250,
    w: 34,
    h: 26,
    gravity: 0.25,
    jump: 4.6,
    velocity: 0,
    rotation: 0,

    draw() {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

        this.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.velocity * 0.1)));
        ctx.rotate(this.rotation);

        ctx.fillStyle = "#f1c40f";
        ctx.beginPath();
        ctx.ellipse(0, 0, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#d35400";
        ctx.stroke();

        ctx.fillStyle = "#e67e22";
        ctx.beginPath();
        ctx.ellipse(-6, 2, 8, 5, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(6, -5, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(8, -5, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#e74c3c";
        ctx.beginPath();
        ctx.moveTo(10, -2);
        ctx.lineTo(20, 2);
        ctx.lineTo(10, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    },

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y + this.h >= canvas.height - 100) {
            this.y = canvas.height - 100 - this.h;
            endGame();
        }

        if (this.y <= 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },

    flap() {
        this.velocity = -this.jump;
    }
};

// Pipa
const pipes = [];
const pipeWidth = 52;
const pipeGap = 130;

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - 100 - pipeGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - 100 - topHeight - pipeGap,
        passed: false
    });
}

function updatePipes() {
    if (frame % 90 === 0) createPipe();

    for (let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= 2;

        if (
            bird.x + bird.w > p.x &&
            bird.x < p.x + pipeWidth &&
            (bird.y < p.top || bird.y + bird.h > canvas.height - 100 - p.bottom)
        ) {
            endGame();
        }

        if (!p.passed && p.x + pipeWidth < bird.x) {
            p.passed = true;
            score++;
        }

        if (p.x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

function drawPipes() {
    pipes.forEach(p => {
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(p.x, 0, pipeWidth, p.top);
        ctx.strokeStyle = "#1e8449";
        ctx.lineWidth = 3;
        ctx.strokeRect(p.x, 0, pipeWidth, p.top);

        ctx.fillRect(p.x - 3, p.top - 20, pipeWidth + 6, 20);
        ctx.strokeRect(p.x - 3, p.top - 20, pipeWidth + 6, 20);

        const bottomY = canvas.height - 100 - p.bottom;
        ctx.fillRect(p.x, bottomY, pipeWidth, p.bottom);
        ctx.strokeRect(p.x, bottomY, pipeWidth, p.bottom);

        ctx.fillRect(p.x - 3, bottomY, pipeWidth + 6, 20);
        ctx.strokeRect(p.x - 3, bottomY, pipeWidth + 6, 20);
    });
}

function drawBackground() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(80, 100, 30, 0, Math.PI * 2);
    ctx.arc(110, 90, 40, 0, Math.PI * 2);
    ctx.arc(140, 100, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 15);
}

function drawScore() {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.font = "900 32px Arial";
    ctx.textAlign = "center";
    ctx.strokeText(score, canvas.width / 2, 60);
    ctx.fillText(score, canvas.width / 2, 60);
}

function loop() {
    if (!gameStarted || gameOver) return;

    drawBackground();
    bird.update();
    bird.draw();
    updatePipes();
    drawPipes();
    drawScore();

    frame++;
    requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && gameStarted && !gameOver) bird.flap();
});

canvas.addEventListener("click", () => {
    if (gameStarted && !gameOver) bird.flap();
});

function startGame() {
    const uInput = document.getElementById("username").value.trim();
    const wInput = document.getElementById("noWA").value.trim();

    if (!uInput || !wInput) {
        alert("Harap isi Username dan Nomor WA terlebih dahulu!");
        return;
    }

    username = uInput;
    noWA = wInput;

    document.getElementById("start-screen").style.display = "none";
    gameStarted = true;
    loop();
}

function endGame() {
    gameOver = true;
    document.getElementById("final-score").innerText = score;
    document.getElementById("gameover-screen").style.display = "flex";

    sendDataToSheets();
    fetchLeaderboard();
}

function restartGame() {
    score = 0;
    frame = 0;
    pipes.length = 0;
    bird.y = 250;
    bird.velocity = 0;
    gameOver = false;
    document.getElementById("gameover-screen").style.display = "none";
    loop();
}

function sendDataToSheets() {
    if (SCRIPT_URL === "GANTI_DENGAN_URL_DEPLOYMENT_ANDA") return;

    const payload = { username: username, noWA: noWA, score: score };

    fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    }).catch(err => console.error("Gagal mengirim data:", err));
}

function fetchLeaderboard() {
    const startLbList = document.getElementById("start-leaderboard-list");
    const endLbList = document.getElementById("end-leaderboard-list");

    if (SCRIPT_URL === "GANTI_DENGAN_URL_DEPLOYMENT_ANDA") {
        const defaultMsg = "<p class='loading-text'>Atur SCRIPT_URL untuk memuat data.</p>";
        startLbList.innerHTML = defaultMsg;
        endLbList.innerHTML = defaultMsg;
        return;
    }

    fetch(SCRIPT_URL)
        .then(res => res.json())
        .then(data => {
            let html = "";
            data.forEach((item, index) => {
                html += `
                    <div class="lb-item">
                        <span><span class="rank">#${index + 1}</span> ${item.username}</span>
                        <span><b>${item.score}</b> Pts</span>
                    </div>
                `;
            });

            startLbList.innerHTML = html || "<p class='loading-text'>Belum ada data.</p>";
            endLbList.innerHTML = html || "<p class='loading-text'>Belum ada data.</p>";
        })
        .catch(err => {
            const errorMsg = "<p class='loading-text' style='color: #e74c3c;'>Gagal memuat leaderboard.</p>";
            startLbList.innerHTML = errorMsg;
            endLbList.innerHTML = errorMsg;
        });
}

// Muat Leaderboard & Background saat halaman pertama kali dibuka
drawBackground();
fetchLeaderboard();
