const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const countdown = document.getElementById("countdown");

const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");

const germLayer = document.getElementById("germLayer");
const foamLayer = document.getElementById("foamLayer");

const toothbrush = document.getElementById("toothbrush");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const brushBtn = document.getElementById("brushBtn");

const backButton = document.getElementById("backButton");

const finalScore = document.getElementById("finalScore");
const rankText = document.getElementById("rankText");
const rankImage = document.getElementById("rankImage");
const resultComment =
  document.getElementById("resultComment");

const shareBtn = document.getElementById("shareBtn");
const retryBtn = document.getElementById("retryBtn");
const homeBtn = document.getElementById("homeBtn");

const registerScoreBtn =
  document.getElementById("registerScoreBtn");

const resultButtons =
  document.getElementById("resultButtons");

// Supabase
const SUPABASE_URL =
  "https://gmncxnybsovlallxgnkd.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_ly3h5OhL8HDSHhYdmJq_Fw_9pG3mhla";

const kabaDb = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// 音声
const bgm = new Audio("bgm.mp3");
bgm.volume = 0.6;

const seStart = new Audio("start.mp3");
const seBrush = new Audio("brush.mp3");
const seBossDown = new Audio("boss_down.mp3");
const seResult = new Audio("result.mp3");
const seButton = new Audio("button.mp3");

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

let score = 0;
let time = 45;

let gameStarted = false;
let countingDown = false;

let germs = [];

let spawnTimer = null;
let countTimer = null;
let countdownTimer = null;

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

  if (gameStarted || countingDown) return;

  playSound(seStart);

  score = 0;
  time = 45;

  germs = [];

  brushLane = 1;

  clearTimeout(spawnTimer);
  clearInterval(countTimer);
  clearInterval(countdownTimer);

  germLayer.innerHTML = "";
  foamLayer.innerHTML = "";

  scoreText.textContent = score;
  timeText.textContent = time;

  moveBrush();

  showScreen(gameScreen);

  countingDown = true;

  countdown.style.display = "block";

  let count = 3;

  countdown.textContent = count;

  countdownTimer = setInterval(() => {

    count--;

    if (count > 0) {

      countdown.textContent = count;

    } else {

      clearInterval(countdownTimer);

      countdown.style.display = "none";

      countingDown = false;

      actuallyStartGame();
    }

  }, 1000);
}

function actuallyStartGame() {

  gameStarted = true;

  bgm.currentTime = 0;

  bgm.play().catch(() => {});

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

  let hitSomething = false;
  let defeatedBoss = false;

  for (let i = germs.length - 1; i >= 0; i--) {

    const germ = germs[i];

    const germLane = Number(
      germ.dataset.lane
    );

    if (germLane === brushLane) {

      hitSomething = true;

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

        if (isBoss) {
          defeatedBoss = true;
        }

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

  if (defeatedBoss) {

    playSound(seBossDown);

  } else if (hitSomething) {

    playSound(seBrush);
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

function moveLeft() {

  if (!gameStarted) return;

  playSound(seButton);

  brushLane--;

  if (brushLane < 0) {
    brushLane = 0;
  }

  moveBrush();
}

function moveRight() {

  if (!gameStarted) return;

  playSound(seButton);

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

  bgm.pause();
  bgm.currentTime = 0;

  germLayer.innerHTML = "";
  foamLayer.innerHTML = "";

  germs = [];

  showScreen(resultScreen);

  resultButtons.classList.add("hidden");

  setTimeout(() => {
    resultButtons.classList.remove("hidden");
  }, 1500);

  playSound(seResult);

  finalScore.textContent =
    score + "てん";

  if (score >= 800) {

    rankText.textContent =
      "はみがきマスター！";

    rankImage.src =
      "rank_best.png";

    resultComment.textContent =
      "むしばきんが にげだした！";

  } else if (score >= 450) {

    rankText.textContent =
      "ピカピカ！";

    rankImage.src =
      "rank_good.png";

    resultComment.textContent =
      "おくちが ピカピカ！";

  } else {

    rankText.textContent =
      "みがきのこし…";

    rankImage.src =
      "rank_bad.png";

    resultComment.textContent =
      "もっと ゴシゴシしよう！";
  }
}