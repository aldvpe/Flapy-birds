// GANTI URL INI DENGAN URL WEB APP GOOGLE APPS SCRIPT ANDA
const SCRIPT_URL = "URL_WEB_APP_ANDA_DI_SINI";

const canvas = document.getElementById("birdCanvas");
const ctx = canvas.getContext("2d");

let username = "", whatsapp = "";
let score = 0, frames = 0, gameRunning = false;

// Game Objects
const bird = {
  x: 50, 
  y: 150, 
  w: 20, 
  h: 20, 
  gravity: 0.25, 
  jump: 4.6, 
  velocity: 0,
  
  draw() {
    ctx.fillStyle = "#ffeb3b";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  },
  
  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
    if (this.y + this.h >= canvas.height || this.y <= 0) gameOver();
  },
  
  reset() { 
    this.y = 150; 
    this.velocity = 0; 
  }
};

const pipes = {
  position: [], 
  w: 50, 
  gap: 120, 
  dx: 2,
  
  draw() {
    ctx.fillStyle = "#2e7d32";
    for (let p of this.position) {
      ctx.fillRect(p.x, 0, this.w, p.top);
      ctx.fillRect(p.x, canvas.height - p.bottom, this.w, p.bottom);
    }
  },
  
  update() {
    if (frames % 100 === 0) {
      let topH = Math.floor(Math.random() * (canvas.height - this.gap - 100)) + 50;
      let bottomH = canvas.height - this.gap - topH;
      this.position.push({ x: canvas.width, top: topH, bottom: bottomH });
    }
    
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      p.x -= this.dx;

      // Collision Detection
      if (bird.x + bird.w > p.x && bird.x < p.x + this.w &&
         (bird.y < p.top || bird.y + bird.h > canvas.height - p.bottom)) {
        gameOver();
      }

      // Add Score
      if (p.x + this.w < bird.x && !p.passed) {
        score++;
        p.passed = true;
      }

      if (p.x + this.w < 0) { 
        this.position.shift(); 
        i--; 
      }
    }
  },
  
  reset() { 
    this.position = []; 
  }
};

// Controls
window.addEventListener("keydown", (e) => { 
  if (e.code === "Space" && gameRunning) bird.velocity = -bird.jump; 
});

canvas.addEventListener("touchstart", () => { 
  if (gameRunning) bird.velocity = -bird.jump; 
});

function startGame() {
  username = document.getElementById("username").value.trim();
  whatsapp = document.getElementById("whatsapp").value.trim();

  if (!username || !whatsapp) {
    alert("Harap isi Username dan Nomor WA!");
    return;
  }

  document.getElementById("start-screen").classList.add("hidden");
  resetState();
  gameRunning = true;
  loop();
}

function resetState() {
  bird.reset();
  pipes.reset();
  score = 0;
  frames = 0;
}

function gameOver() {
  gameRunning = false;
  document.getElementById("final-score").innerText = score;
  document.getElementById("game-over-screen").classList.remove("hidden");
  sendScoreToDatabase();
}

function restartGame() {
  document.getElementById("game-over-screen").classList.add("hidden");
  resetState();
  gameRunning = true;
  loop();
}

function loop() {
  if (!gameRunning) return;
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  pipes.draw();
  pipes.update();
  bird.draw();
  bird.update();

  // Draw Score
  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${score}`, 15, 30);

  frames++;
  requestAnimationFrame(loop);
}

// Database API Integration
function sendScoreToDatabase() {
  document.getElementById("status-msg").innerText = "Menyimpan skor...";
  
  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ username: username, whatsapp: whatsapp, score: score })
  })
  .then(res => res.json())
  .then(() => {
    document.getElementById("status-msg").innerText = "Skor berhasil disimpan!";
    fetchLeaderboard();
  })
  .catch(() => {
    document.getElementById("status-msg").innerText = "Gagal menyimpan skor.";
    fetchLeaderboard();
  });
}

function fetchLeaderboard() {
  fetch(SCRIPT_URL)
  .then(res => res.json())
  .then(data => {
    let tbody = document.getElementById("leaderboard-body");
    tbody.innerHTML = "";
    data.forEach((row, index) => {
      tbody.innerHTML += `<tr><td>${index + 1}</td><td>${row.username}</td><td>${row.score}</td></tr>`;
    });
  });
}
