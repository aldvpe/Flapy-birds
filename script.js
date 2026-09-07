// MASUKKAN URL WEB APP GOOGLE APPS SCRIPT ANDA DI SINI
const SCRIPT_URL = 'PASTE_WEB_APP_URL_DI_SINI';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');

let username = '', whatsapp = '', score = 0, gameLoopId = null;
let isGameOver = false, isGameStarted = false;

// Entity Game
const bird = { x: 50, y: 300, w: 20, h: 20, gravity: 0.35, jump: -6.5, velocity: 0 };
let pipes = [];
const pipeWidth = 50, pipeGap = 130, pipeSpeed = 2;

function fetchLeaderboard() {
    if (SCRIPT_URL === 'PASTE_WEB_APP_URL_DI_SINI') {
        document.getElementById('leaderboard-list').innerHTML = "<div class='loading-text'>URL Script belum diisi</div>";
        return;
    }
    fetch(SCRIPT_URL)
        .then(res => res.json())
        .then(data => {
            let html = '';
            if (!data || data.length === 0) html = "<div class='loading-text'>Belum ada data</div>";
            else {
                data.forEach((item, i) => {
                    let topClass = (i === 0) ? 'rank-1' : '';
                    html += `
                        <div class="leaderboard-item ${topClass}">
                            <span class="rank">${i + 1}.</span>
                            <span class="username">${item.username}</span>
                            <span class="score">${item.score}</span>
                        </div>`;
                });
            }
            document.getElementById('leaderboard-list').innerHTML = html;
        })
        .catch(() => { document.getElementById('leaderboard-list').innerHTML = "<div class='loading-text'>Gagal memuat</div>"; });
}

function startGame() {
    username = document.getElementById('username').value.trim();
    whatsapp = document.getElementById('whatsapp').value.trim();

    if (!username || !whatsapp) {
        alert('Harap isi Username dan Nomor WA!');
        return;
    }

    document.getElementById('start-menu').classList.add('hidden');
    resetGameState();
    isGameStarted = true;
    gameLoop();
}

function resetGameState() {
    bird.y = 300;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    scoreDisplay.innerText = '0';
    isGameOver = false;
}

function jump() {
    if (isGameStarted && !isGameOver) bird.velocity = bird.jump;
}

document.addEventListener('keydown', (e) => { if (e.code === 'Space') jump(); });
// Support klik pada seluruh area game container, bukan hanya canvas
document.getElementById('game-container').addEventListener('click', jump);

function update() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Batas Atas & Bawah
    if (bird.y + bird.h >= canvas.height || bird.y <= 0) gameOver();

    // Pipa
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        let topHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 30;
        pipes.push({ x: canvas.width, top: topHeight, passed: false });
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;

        // Deteksi Tabrakan
        if (bird.x + bird.w > pipes[i].x && bird.x < pipes[i].x + pipeWidth) {
            if (bird.y < pipes[i].top || bird.y + bird.h > pipes[i].top + pipeGap) {
                gameOver();
            }
        }

        // Tambah Skor
        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].passed = true;
            score++;
            scoreDisplay.innerText = score;
        }

        if (pipes[i].x + pipeWidth < 0) pipes.splice(i, 1);
    }
}

function draw() {
    ctx.fillStyle = '#70c5ce'; // Langit
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gambar Burung (Sedikit diperbaiki bentuknya dengan outline)
    ctx.fillStyle = '#f1c40f'; // Warna Burung
    ctx.fillRect(bird.x, bird.y, bird.w, bird.h);
    ctx.strokeStyle = '#a18100'; // Outline gelap
    ctx.lineWidth = 2;
    ctx.strokeRect(bird.x, bird.y, bird.w, bird.h);

    // Gambar Pipa (Diberi outline agar lebih tegas)
    ctx.fillStyle = '#2ecc71'; // Warna utama pipa
    ctx.strokeStyle = '#1a7a43'; // Warna border pipa
    ctx.lineWidth = 3;
    pipes.forEach(p => {
        // Pipa Atas
        ctx.fillRect(p.x, 0, pipeWidth, p.top);
        ctx.strokeRect(p.x, 0, pipeWidth, p.top);

        // Pipa Bawah
        ctx.fillRect(p.x, p.top + pipeGap, pipeWidth, canvas.height - p.top - pipeGap);
        ctx.strokeRect(p.x, p.top + pipeGap, pipeWidth, canvas.height - p.top - pipeGap);
    });
}

function gameLoop() {
    if (isGameOver) return;
    update();
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(gameLoopId);
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-menu').classList.remove('hidden');
    sendScoreToSheets(username, whatsapp, score);
}

function sendScoreToSheets(username, whatsapp, score) {
    if (SCRIPT_URL === 'PASTE_WEB_APP_URL_DI_SINI') return;
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, whatsapp, score })
    });
}

function restartGame() {
    document.getElementById('game-over-menu').classList.add('hidden');
    fetchLeaderboard();
    document.getElementById('start-menu').classList.remove('hidden');
}

// Muat leaderboard saat pertama membuka halaman
fetchLeaderboard();
