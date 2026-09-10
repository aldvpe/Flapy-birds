// JavaScript - Flappy Bird Mechanics & Google Sheets Integration

// GANTI URL DI BAWAH DENGAN WEB APP URL APPS SCRIPT ANDA
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzyhMcPasJdZAWzbcBY1ZL8kQuNTC5vHGIrYlx3Aw2l64ncmcJUuQFoTjSvL_2Vxsg/exec";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let username = "";
let noWA = "";
let score = 0;
let gameOver = false;
let gameStarted = false;
let frame = 0;

// Objek Burung (Bird)
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

        // Rotasi burung berdasarkan kecepatan jatuh
        this.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.velocity * 0.1)));
        ctx.rotate(this.rotation);

        // Badan Burung
        ctx.fillStyle = "#f1c40f"; // Kuning
        ctx.beginPath();
        ctx.ellipse(0, 0, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#d35400";
        ctx.stroke();

        // Sayap Burung
        ctx.fillStyle = "#e67e22";
        ctx.beginPath();
        ctx.ellipse(-6, 2, 8, 5, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Mata Burung
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(6, -5, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pupil Mata
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(8, -5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Paruh Burung
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

        // Cek tabrakan dengan tanah
        if (this.y + this.h >= canvas.height - 100) {
            this.y = canvas.height - 100 - this.h;
            endGame();
        }

        // Cek tabrakan dengan atap
        if (this.y <= 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },

    flap() {
        this.velocity = -this.jump;
    }
};

// Array Pipa
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
    if (frame % 90 === 0) {
        createPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= 2;

        // Cek Hitbox Tabrakan
        if (
            bird.x + bird.w > p.x &&
            bird.x < p.x + pipeWidth &&
            (bird.y < p.top || bird.y + bird.h > canvas.height - 100 - p.bottom)
        ) {
            endGame();
        }

        // Hitung Skor saat berhasil melintasi pipa
        if (!p.passed && p.x + pipeWidth < bird.x) {
            p.passed = true;
            score++;
        }

        // Hapus pipa yang keluar layar
        if (p.x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

function drawPipes() {
    pipes.forEach(p => {
        // Pipa Atas
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(p.x, 0, pipeWidth, p.top);
        ctx.strokeStyle = "#1e8449";
        ctx.lineWidth = 3;
        ctx.strokeRect(p.x, 0, pipeWidth, p.top);

        // Bibir Pipa Atas
        ctx.fillRect(p.x - 3, p.top - 20, pipeWidth + 6, 20);
        ctx.strokeRect(p.x - 3, p.top - 20, pipeWidth + 6, 20);

        // Pipa Bawah
        const bottomY = canvas.height - 100 - p.bottom;
        ctx.fillRect(p.x, bottomY, pipeWidth, p.bottom);
        ctx.strokeRect(p.x, bottomY, pipeWidth, p.bottom);

        // Bibir Pipa Bawah
        ctx.fillRect(p.x - 3, bottomY, pipeWidth + 6, 20);
        ctx.strokeRect(p.x - 3, bottomY, pipeWidth + 6, 20);
    });
}

function drawBackground() {
    // Langit
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Awan-awan
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(80, 100, 30, 0, Math.PI * 2);
    ctx.arc(110, 90, 40, 0, Math.PI * 2);
    ctx.arc(140, 100, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(260, 180, 25, 0, Math.PI * 2);
    ctx.arc(285, 170, 35, 0, Math.PI * 2);
    ctx.arc(310, 180, 25, 0, Math.PI * 2);
    ctx.fill();

    // Tanah (Ground)
    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // Rumput di Atas Tanah
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 15);
    ctx.strokeStyle = "#1e8449";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 85);
    ctx.lineTo(canvas.width, canvas.height - 85);
    ctx.stroke();
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

// Event Controls
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && gameStarted && !gameOver) {
        bird.flap();
    }
});

canvas.addEventListener("click", () => {
    if (gameStarted && !gameOver) {
        bird.flap();
    }
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

    const payload = {
        username: username,
        noWA: noWA,
        score: score
    };

    fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    }).catch(err => console.error("Gagal mengirim data:", err));
}

function fetchLeaderboard() {
    const lbContainer = document.getElementById("leaderboard-list");
    lbContainer.innerHTML = "<p class='loading-text'>Memuat Leaderboard...</p>";

    if (SCRIPT_URL === "GANTI_DENGAN_URL_DEPLOYMENT_ANDA") {
        lbContainer.innerHTML = "<div class='lb-title'>Top Player</div><p class='loading-text'>Atur SCRIPT_URL untuk melihat leaderboard real-time.</p>";
        return;
    }

    fetch(SCRIPT_URL)
        .then(res => res.json())
        .then(data => {
            let html = "<div class='lb-title'>🏆 Top 5 Player</div>";
            data.forEach((item, index) => {
                html += `
                    <div class="lb-item">
                        <span><span class="rank">#${index + 1}</span> ${item.username}</span>
                        <span><b>${item.score}</b> Pts</span>
                    </div>
                `;
            });
            lbContainer.innerHTML = html;
        })
        .catch(err => {
            lbContainer.innerHTML = "<p class='loading-text' style='color: red;'>Gagal memuat leaderboard</p>";
        });
}

// Initial Draw Background on Load
drawBackground();
