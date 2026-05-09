const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");

const germLayer = document.getElementById("germLayer");
const foamLayer = document.getElementById("foamLayer");

const toothbrush = document.getElementById("toothbrush");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const brushBtn = document.getElementById("brushBtn");

const finalScore = document.getElementById("finalScore");
const rankText = document.getElementById("rankText");
const rankImage = document.getElementById("rankImage");

const retryBtn = document.getElementById("retryBtn");

let score = 0;
let time = 45;
let gameStarted = false;

let germs = [];

let spawnTimer = null;
let countTimer = null;

let brushLane = 1;

const lanes = [
  { x: 20,  y: 100 },
  { x: 95,  y: 100 },
  { x: 170, y: 100 },
  { x: 245, y: 100 }
];

const brushOffsetX = 180;

function showScreen(screen) {

  titleScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  resultScreen.classList.remove("active");

  screen.classList.add("active");
}

function startGame(e) {

  if (e) e.preventDefault();

  if (gameStarted) return;

  score = 0;
  time = 45;

  germs = [];

  brushLane = 1;

  germLayer.innerHTML = "";
  foamLayer.innerHTML = "";

  scoreText.textContent = score;
  timeText.textContent = time;

  moveBrush();

  showScreen(gameScreen);

  gameStarted = true;

  spawnLoop();

  countTimer = setInterval(() => {

    time--;

    timeText.textContent = time;

    if (time <= 0) {
      endGame();
    }

  }, 1000);
}

function spawnLoop() {

  if (!gameStarted) return;

  spawnGerm();

  spawnTimer = setTimeout(spawnLoop, 700);
}

function spawnGerm() {

  const lane = Math.floor(
    Math.random() * lanes.length
  );

  const spot = lanes[lane];

  const isBoss = Math.random() < 0.15;

  const germ = document.createElement("img");

  germ.src = isBoss
    ? "boss.png"
    : "germ.png";

  germ.className = isBoss
    ? "boss"
    : "germ";

  germ.style.left = isBoss
    ? (spot.x - 28) + "px"
    : spot.x + "px";

  germ.style.top = isBoss
    ? (spot.y - 34) + "px"
    : spot.y + "px";

  germ.dataset.lane = lane;

  germ.dataset.hp = isBoss ? 3 : 1;

  germ.dataset.type = isBoss
    ? "boss"
    : "normal";

  germLayer.appendChild(germ);

  germs.push(germ);
}

function attack(e) {

  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (!gameStarted) return;

  toothbrush.classList.add("brushAttack");

  setTimeout(() => {
    toothbrush.classList.remove("brushAttack");
  }, 80);

  for (let i = germs.length - 1; i >= 0; i--) {

    const germ = germs[i];

    const germLane = Number(
      germ.dataset.lane
    );

    if (germLane === brushLane) {

      let hp = Number(
        germ.dataset.hp
      );

      hp--;

      germ.dataset.hp = hp;

      const spot = lanes[germLane];

      makeFoam(
        spot.x - 10,
        spot.y - 10
      );

      if (hp <= 0) {

        const isBoss =
          germ.dataset.type === "boss";

        score += isBoss ? 50 : 10;

        scoreText.textContent = score;

        germ.remove();

        germs.splice(i, 1);

      } else {

        germ.style.transform =
          "scale(0.85) rotate(-8deg)";

        setTimeout(() => {

          if (germ) {
            germ.style.transform = "";
          }

        }, 120);
      }
    }
  }
}

function makeFoam(x, y) {

  const foam = document.createElement("img");

  foam.src = "foam.png";
  foam.className = "foam";

  foam.style.left = x + "px";
  foam.style.top = y + "px";

  foamLayer.appendChild(foam);

  setTimeout(() => {
    foam.remove();
  }, 400);
}

function moveBrush() {

  const targetX =
    lanes[brushLane].x - brushOffsetX;

  toothbrush.style.left =
    targetX + "px";
}

function moveLeft(e) {

  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (!gameStarted) return;

  brushLane--;

  if (brushLane < 0) {
    brushLane = 0;
  }

  moveBrush();
}

function moveRight(e) {

  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (!gameStarted) return;

  brushLane++;

  if (brushLane > lanes.length - 1) {
    brushLane = lanes.length - 1;
  }

  moveBrush();
}

function endGame() {

  gameStarted = false;

  clearTimeout(spawnTimer);
  clearInterval(countTimer);

  germLayer.innerHTML = "";
  foamLayer.innerHTML = "";

  germs = [];

  showScreen(resultScreen);

  finalScore.textContent =
    score + "てん";

  if (score >= 800) {

    rankText.textContent =
      "はみがきマスター！";

    rankImage.src =
      "rank_best.png";

  } else if (score >= 450) {

    rankText.textContent =
      "ピカピカ！";

    rankImage.src =
      "rank_good.png";

  } else {

    rankText.textContent =
      "みがき残し…";

    rankImage.src =
      "rank_bad.png";
  }

  retryBtn.style.opacity = 0;
  retryBtn.style.pointerEvents = "none";

  setTimeout(() => {

    retryBtn.style.opacity = 1;
    retryBtn.style.pointerEvents = "auto";

  }, 900);
}

function resetToTitle(e) {

  if (e) e.preventDefault();

  gameStarted = false;

  clearTimeout(spawnTimer);
  clearInterval(countTimer);

  retryBtn.style.opacity = 0;
  retryBtn.style.pointerEvents = "none";

  showScreen(titleScreen);
}

titleScreen.addEventListener(
  "click",
  startGame
);

titleScreen.addEventListener(
  "touchstart",
  startGame,
  { passive: false }
);

leftBtn.addEventListener(
  "click",
  moveLeft
);

rightBtn.addEventListener(
  "click",
  moveRight
);

leftBtn.addEventListener(
  "touchstart",
  moveLeft,
  { passive: false }
);

rightBtn.addEventListener(
  "touchstart",
  moveRight,
  { passive: false }
);

brushBtn.addEventListener(
  "click",
  attack
);

brushBtn.addEventListener(
  "touchstart",
  attack,
  { passive: false }
);

retryBtn.addEventListener(
  "click",
  resetToTitle
);

retryBtn.addEventListener(
  "touchstart",
  resetToTitle,
  { passive: false }
);