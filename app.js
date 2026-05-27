const games = [
  {
    title: "Nebula Drift",
    subtitle: "Cinematic space exploration",
    description: "Erkunde lautlose Städte aus Glas, lebendige Sternenfelder und einen Soundtrack, der auf deine Bewegung reagiert.",
    accentA: "rgba(93, 245, 255, 0.88)",
    accentB: "rgba(156, 107, 255, 0.88)",
    tilt: "-10deg"
  },
  {
    title: "Echo Runner",
    subtitle: "Hyper-speed cyber racing",
    description: "Rase durch Neon-Metropolen, in denen jede Kurve wie flüssiges Licht reagiert und der Track sich live neu aufbaut.",
    accentA: "rgba(0, 255, 210, 0.88)",
    accentB: "rgba(54, 104, 255, 0.88)",
    tilt: "8deg"
  },
  {
    title: "Void Garden",
    subtitle: "Dreamlike strategy world",
    description: "Züchte schwebende Biome in einem dunklen Kosmos und verteidige sie mit eleganten, organischen Maschinen.",
    accentA: "rgba(190, 91, 255, 0.86)",
    accentB: "rgba(66, 232, 255, 0.82)",
    tilt: "-18deg"
  },
  {
    title: "Iron Orchid",
    subtitle: "Mech ballet arena",
    description: "Führe federleichte Mechs durch choreografierte Kämpfe, bei denen Präzision wichtiger ist als rohe Gewalt.",
    accentA: "rgba(255, 92, 128, 0.88)",
    accentB: "rgba(255, 190, 80, 0.86)",
    tilt: "14deg"
  },
  {
    title: "Titan Low",
    subtitle: "Deep frontier mystery",
    description: "Steige unter die Oberfläche eines fremden Mondes und entschlüssele Signale, die älter sind als dein Sonnensystem.",
    accentA: "rgba(80, 145, 255, 0.9)",
    accentB: "rgba(0, 255, 180, 0.78)",
    tilt: "-4deg"
  },
  {
    title: "Lumen Forge",
    subtitle: "Creative build universe",
    description: "Baue schillernde Städte aus Licht, teile sie im Cloud-Verbund und betrete die Welten deiner Freunde nahtlos.",
    accentA: "rgba(255, 215, 95, 0.9)",
    accentB: "rgba(155, 80, 255, 0.86)",
    tilt: "18deg"
  },
  {
    title: "Arctic Signal",
    subtitle: "Co-op mystery expedition",
    description: "Folge einem Signal unter dem Eis, während adaptive Haptik Wind, Druck und Entfernung spürbar macht.",
    accentA: "rgba(160, 250, 255, 0.92)",
    accentB: "rgba(55, 100, 255, 0.88)",
    tilt: "-15deg"
  }
];

const carousel = document.querySelector("#gameCarousel");
const featuredTitle = document.querySelector("#featuredTitle");
const featuredDescription = document.querySelector("#featuredDescription");
const featuredCover = document.querySelector("#featuredCover");
const clock = document.querySelector("#clock");
const nowPlaying = document.querySelector(".now-playing");
let selectedIndex = 0;

function renderGames() {
  carousel.innerHTML = games
    .map(
      (game, index) => `
        <button class="game-card ${index === selectedIndex ? "selected" : ""}" type="button" data-index="${index}" style="--accent-a: ${game.accentA}; --accent-b: ${game.accentB}; --tilt: ${game.tilt}">
          <div class="game-visual" aria-hidden="true">
            <span></span>
            <i></i>
          </div>
          <div class="game-info">
            <h3>${game.title}</h3>
            <p>${game.subtitle}</p>
          </div>
        </button>
      `
    )
    .join("");

  document.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("click", () => selectGame(Number(card.dataset.index), true));
    card.addEventListener("pointermove", handleCardTilt);
    card.addEventListener("pointerleave", resetCardTilt);
  });
}

function selectGame(index, scrollIntoView = false) {
  selectedIndex = (index + games.length) % games.length;
  const game = games[selectedIndex];

  featuredTitle.textContent = game.title;
  featuredDescription.textContent = game.description;
  featuredCover.style.background = `radial-gradient(circle at 42% 34%, rgba(255, 255, 255, 0.2), transparent 11%), linear-gradient(145deg, ${game.accentB}, ${game.accentA})`;

  document.querySelectorAll(".game-card").forEach((card, cardIndex) => {
    card.classList.toggle("selected", cardIndex === selectedIndex);
    if (scrollIntoView && cardIndex === selectedIndex) {
      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  });
}

function handleCardTilt(event) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const rotateY = ((x / rect.width) - 0.5) * 10;
  const rotateX = -((y / rect.height) - 0.5) * 10;
  card.style.transform = `translateY(-16px) scale(1.035) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function resetCardTilt(event) {
  event.currentTarget.style.transform = "";
}

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function addPointerGlow() {
  if (!nowPlaying) return;

  nowPlaying.addEventListener("pointermove", (event) => {
    const rect = nowPlaying.getBoundingClientRect();
    const mx = ((event.clientX - rect.left) / rect.width) * 100;
    const my = ((event.clientY - rect.top) / rect.height) * 100;
    nowPlaying.style.setProperty("--mx", `${mx}%`);
    nowPlaying.style.setProperty("--my", `${my}%`);
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    selectGame(selectedIndex + 1, true);
  }

  if (event.key === "ArrowLeft") {
    selectGame(selectedIndex - 1, true);
  }
});

renderGames();
selectGame(0);
updateClock();
addPointerGlow();
setInterval(updateClock, 30_000);
