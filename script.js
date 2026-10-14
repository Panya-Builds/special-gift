
const intro = document.getElementById("intro");
const giftScene = document.getElementById("giftScene");
const giftImage = document.getElementById("giftImage");
const roseRain = document.getElementById("rose-rain");
const lovePage = document.getElementById("lovePage");

const lockButton = document.getElementById("lockButton");
const lockImage = document.getElementById("lockImage");
const lockCaption = document.getElementById("lockCaption");
const scrollHint = document.getElementById("scrollHint");

const memoryPage = document.getElementById("memoryPage");
const loadingStage = document.getElementById("loadingStage");
const memoryGallery = document.getElementById("memoryGallery");
const galleryLoading = document.getElementById("galleryLoading");

const roseImages = [
  "media/rose-red.png",
  "media/rose-pink.png",
  "media/rose-white.png"
];

let isOpening = false;
let transitionStarted = false;
let lockOpening = false;
let spawnTimer = null;
let coverageTimer = null;

const roses = [];

let columnHeights = [];
let columnCount = 0;
let columnWidth = 44;

const rand = (min, max) =>
  Math.random() * (max - min) + min;

/* FIRST SCREEN: ROSE RAIN */

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
  const shortest = Math.min(...columnHeights);

  const candidates = [];

  columnHeights.forEach((height, index) => {
    if (height <= shortest + 14) candidates.push(index);
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

  const targetY =
    screenHeight - columnHeights[column] - size;

  columnHeights[column] += size * 0.58;

  const drift = rand(-8, 8);
  const rotation = rand(-35, 35);
  const duration = rand(0.85, 1.35);

  const rose = document.createElement("img");
  rose.src = roseImages[Math.floor(Math.random() * roseImages.length)];
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

  const item = { element: rose, landed: false };

  roses.push(item);
  roseRain.appendChild(rose);

  rose.addEventListener("error", () => {
    item.landed = true;
    rose.remove();
  }, { once: true });

  rose.addEventListener("animationend", () => {
    if (transitionStarted || !rose.isConnected) return;

    rose.style.left = `${targetX + drift}px`;
    rose.style.top = `${targetY}px`;
    rose.style.setProperty("--final-rotation", `${rotation}deg`);

    rose.classList.add("settled");
    item.landed = true;

    checkCoverage();
  }, { once: true });
}

function checkCoverage() {
  if (transitionStarted || columnHeights.length === 0) return;

  if (Math.min(...columnHeights) >= window.innerHeight * 0.9) {
    finishRoseTransition();
  }
}

function startRoseRain() {
  setupColumns();
  roseRain.classList.add("active");

  for (let i = 0; i < 24; i++) {
    setTimeout(() => {
      if (!transitionStarted) createRose();
    }, i * 55);
  }

  spawnTimer = setInterval(() => {
    if (document.hidden || transitionStarted) return;

    for (let i = 0; i < 4; i++) createRose();
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
      rect.left + rect.width / 2 < window.innerWidth / 2 ? -1 : 1;

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

    // Turn the romantic screen into a normal scrollable section.
    lovePage.classList.add("in-flow", "show-content");
    lovePage.setAttribute("aria-hidden", "false");

    scrollHint.classList.add("hint-visible");
  }, 1250);
}

giftScene.addEventListener("click", () => {
  if (isOpening) return;

  isOpening = true;
  intro.classList.add("is-opening");
  startRoseRain();
});

/* LOCK: TILT, OPENED LABEL, THEN NEXT SCREEN */

lockButton.addEventListener("click", async () => {
  if (lockOpening) return;
  lockOpening = true;

  lockButton.classList.add("lock-tilting");
  lockCaption.classList.add("caption-opening");
  scrollHint.classList.remove("hint-visible");

  await wait(450);

  lockButton.classList.add("lock-disappearing");

  lockCaption.innerHTML =
    '<span class="opened-label">› Opened</span>';

  lockCaption.classList.add("caption-opened");

  await wait(650);

  lockButton.style.visibility = "hidden";
  lockCaption.classList.add("caption-disappearing");

  await wait(450);

  memoryPage.classList.add("memory-visible");
  memoryPage.setAttribute("aria-hidden", "false");

  // Scroll gently to the next full-screen section.
  memoryPage.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  // Let the rotating rose loader play before showing the photos.
  await wait(2600);

  loadingStage.classList.add("loader-disappearing");

  await wait(650);

  loadingStage.style.display = "none";
  memoryGallery.classList.add("gallery-visible");
  memoryGallery.setAttribute("aria-hidden", "false");

  const photos = [...memoryGallery.querySelectorAll(".memory-photo")];

  for (let i = 0; i < photos.length; i++) {
    photos[i].classList.add("photo-visible");
    await wait(380);
  }

});

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

window.addEventListener("resize", () => {
  if (!isOpening) setupColumns();
});

setupColumns();


const heartArrowScene = document.getElementById("heartArrowScene");

if (heartArrowScene && memoryGallery) {
  memoryGallery.addEventListener("click", () => {
    heartArrowScene.classList.add("heart-scene-visible");
    heartArrowScene.setAttribute("aria-hidden", "false");
  });
}
