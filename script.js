
const intro = document.getElementById("intro");
const giftScene = document.getElementById("giftScene");
const giftImage = document.getElementById("giftImage");
const roseRain = document.getElementById("rose-rain");
const lovePage = document.getElementById("lovePage");

const roseImages = [
  "media/rose-red.png",
  "media/rose-pink.png",
  "media/rose-white.png"
];

let isOpening = false;
let transitionStarted = false;
let spawnTimer = null;
let coverageTimer = null;

const roses = [];

let columnHeights = [];
let columnCount = 0;
let columnWidth = 44;

const rand = (min, max) =>
  Math.random() * (max - min) + min;

function setupColumns() {
  columnWidth = Math.max(
    32,
    Math.min(44, window.innerWidth / 12)
  );

  columnCount = Math.max(
    1,
    Math.ceil(window.innerWidth / columnWidth)
  );

  columnHeights = new Array(columnCount).fill(0);
}

giftImage.addEventListener("error", () => {
  console.error("Gift image nahi mili: media/giftbox.png");
});

function createRose() {
  if (transitionStarted) return;

  const size = rand(48, 72);
  const screenHeight = window.innerHeight;

  // Choose a column whose rose pile is currently the shortest.
  const shortest = Math.min(...columnHeights);

  const candidates = [];

  columnHeights.forEach((height, index) => {
    if (height <= shortest + 14) {
      candidates.push(index);
    }
  });

  const column =
    candidates[Math.floor(Math.random() * candidates.length)];

  const targetX = Math.max(
    0,
    Math.min(
      window.innerWidth - size,
      column * columnWidth + rand(-5, 5)
    )
  );

  // Work out the final position before the rose starts falling.
  const targetY =
    screenHeight - columnHeights[column] - size;

  // Reserve space for this rose in its column.
  columnHeights[column] += size * 0.58;

  const drift = rand(-8, 8);
  const rotation = rand(-35, 35);
  const duration = rand(0.85, 1.35);

  const rose = document.createElement("img");

  rose.src =
    roseImages[Math.floor(Math.random() * roseImages.length)];

  rose.alt = "";
  rose.className = "falling-rose";
  rose.draggable = false;

  rose.style.left = `${targetX}px`;
  rose.style.top = "0px";
  rose.style.width = `${size}px`;

  rose.style.setProperty("--rose-size", `${size}px`);
  rose.style.setProperty("--fall-duration", `${duration}s`);
  rose.style.setProperty("--fall-distance", `${targetY}px`);
  rose.style.setProperty("--drift", `${drift}px`);
  rose.style.setProperty("--rotation", `${rotation}deg`);

  const item = {
    element: rose,
    landed: false
  };

  roses.push(item);
  roseRain.appendChild(rose);

  rose.addEventListener("error", () => {
    item.landed = true;
    rose.remove();
  }, { once: true });

  rose.addEventListener("animationend", () => {
    if (transitionStarted || !rose.isConnected) return;

    // Keep the rose exactly where the falling animation ended.
    rose.style.left = `${targetX + drift}px`;
    rose.style.top = `${targetY}px`;
    rose.style.setProperty(
      "--final-rotation",
      `${rotation}deg`
    );

    rose.classList.add("settled");
    item.landed = true;

    checkCoverage();
  }, { once: true });
}

function checkCoverage() {
  if (transitionStarted || columnHeights.length === 0) return;

  const shortestPile = Math.min(...columnHeights);

  // Every column must have a substantial pile before transitioning.
  if (shortestPile >= window.innerHeight * 0.9) {
    finishRoseTransition();
  }
}

function startRoseRain() {
  setupColumns();
  roseRain.classList.add("active");

  // Start with a quick wave of roses.
  for (let i = 0; i < 24; i++) {
    setTimeout(() => {
      if (!transitionStarted) createRose();
    }, i * 55);
  }

  // Keep the rain coming while the piles build up.
  spawnTimer = setInterval(() => {
    if (document.hidden || transitionStarted) return;

    for (let i = 0; i < 4; i++) {
      createRose();
    }

    checkCoverage();
  }, 140);

  coverageTimer = setInterval(checkCoverage, 250);
}

function finishRoseTransition() {
  if (transitionStarted) return;

  transitionStarted = true;

  clearInterval(spawnTimer);
  clearInterval(coverageTimer);

  lovePage.classList.add("visible");

  roses.forEach(item => {
    const rose = item.element;

  
      if (!rose.isConnected) return;


    const rect = rose.getBoundingClientRect();

    const direction =
      rect.left + rect.width / 2 < window.innerWidth / 2
        ? -1
        : 1;

    rose.style.animation = "none";

    rose.style.transition =
      "transform 1.15s cubic-bezier(0.65, 0, 0.35, 1), opacity 1s ease";

    requestAnimationFrame(() => {
      rose.style.transform =
        `translateX(${direction * (window.innerWidth + rect.width)}px) rotate(${rand(-300, 300)}deg)`;

      rose.style.opacity = "0";
    });
  });

  setTimeout(() => {
    roseRain.classList.remove("active");
    roseRain.replaceChildren();

    intro.classList.add("is-hidden");
    lovePage.classList.add("show-content");
    lovePage.setAttribute("aria-hidden", "false");
  }, 1250);
}

giftScene.addEventListener("click", () => {
  if (isOpening) return;

  isOpening = true;
  intro.classList.add("is-opening");

  startRoseRain();
});

window.addEventListener("resize", () => {
  if (!isOpening) {
    setupColumns();
  }
});

setupColumns();
