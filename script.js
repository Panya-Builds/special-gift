const intro = document.getElementById("intro");
const giftScene = document.getElementById("giftScene");
const giftImage = document.getElementById("giftImage");

let isOpening = false;

giftImage.addEventListener("error", () => {
  console.error("Gift image nahi mili. media/giftbox.png check kar.");
});

giftScene.addEventListener("click", () => {
  if (isOpening) return;

  isOpening = true;
  intro.classList.add("is-opening");
  startRoseRain();

  setTimeout(() => {
    // Next page ka code agle step mein add karenge.
    console.log("Gift clicked! Ready for the next page.");
  }, 850);
});


const roseRain = document.getElementById("rose-rain");

const roseImages = [
  "media/rose-red.png",
  "media/rose-pink.png",
  "media/rose-white.png"
];

let roseRainStarted = false;

function createFallingRose() {
  const rose = document.createElement("img");

  rose.src = roseImages[
    Math.floor(Math.random() * roseImages.length)
  ];

  rose.alt = "";
  rose.className = "falling-rose";

  const size = 35 + Math.random() * 65;
  const duration = 4 + Math.random() * 5;
  const left = Math.random() * 100;
  const drift = -100 + Math.random() * 200;
  const rotation = -300 + Math.random() * 600;

  rose.style.left = `${left}%`;
  rose.style.setProperty("--rose-size", `${size}px`);
  rose.style.setProperty("--fall-duration", `${duration}s`);
  rose.style.setProperty("--drift", `${drift}px`);
  rose.style.setProperty("--rotation", `${rotation}deg`);

  roseRain.appendChild(rose);

  rose.addEventListener("animationend", () => rose.remove(), {
    once: true
  });

  rose.addEventListener("error", () => rose.remove(), {
    once: true
  });
}

function startRoseRain() {
  if (roseRainStarted) return;

  roseRainStarted = true;

  // Start with a shower of roses.
  for (let i = 0; i < 24; i++) {
    setTimeout(createFallingRose, i * 120);
  }

  // Keep filling the screen with falling roses.
  const roseInterval = setInterval(() => {
    if (document.hidden) return;

    for (let i = 0; i < 3; i++) {
      createFallingRose();
    }
  }, 350);

  // Stop spawning if the page is hidden for a long time.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      roseRain.style.visibility = "hidden";
    } else {
      roseRain.style.visibility = "visible";
    }
  });
}
