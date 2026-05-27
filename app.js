const games = [
  {
    title: "Nebula Drift",
    subtitle: "Cinematic space exploration",
    genre: "Adventure",
    progress: 72,
    description: "Erkunde lautlose Städte aus Glas, lebendige Sternenfelder und einen Soundtrack, der auf deine Bewegung reagiert.",
    launch: "Sternentor kalibriert · Gravitation synchronisiert · Lichttriebwerk bereit",
    accentA: "rgba(93, 245, 255, 0.88)",
    accentB: "rgba(156, 107, 255, 0.88)",
    tilt: "-10deg"
  },
  {
    title: "Echo Runner",
    subtitle: "Hyper-speed cyber racing",
    genre: "Racing",
    progress: 41,
    description: "Rase durch Neon-Metropolen, in denen jede Kurve wie flüssiges Licht reagiert und der Track sich live neu aufbaut.",
    launch: "Neonstrecke geladen · Reflexsystem online · Hyperloop geöffnet",
    accentA: "rgba(0, 255, 210, 0.88)",
    accentB: "rgba(54, 104, 255, 0.88)",
    tilt: "8deg"
  },
  {
    title: "Void Garden",
    subtitle: "Dreamlike strategy world",
    genre: "Strategy",
    progress: 18,
    description: "Züchte schwebende Biome in einem dunklen Kosmos und verteidige sie mit eleganten, organischen Maschinen.",
    launch: "Samenmatrix erwacht · Traumklima berechnet · Garten öffnet sich",
    accentA: "rgba(190, 91, 255, 0.86)",
    accentB: "rgba(66, 232, 255, 0.82)",
    tilt: "-18deg"
  },
  {
    title: "Iron Orchid",
    subtitle: "Mech ballet arena",
    genre: "Action",
    progress: 56,
    description: "Führe federleichte Mechs durch choreografierte Kämpfe, bei denen Präzision wichtiger ist als rohe Gewalt.",
    launch: "Mech-Kern gezündet · Arena synchronisiert · Choreografie bereit",
    accentA: "rgba(255, 92, 128, 0.88)",
    accentB: "rgba(255, 190, 80, 0.86)",
    tilt: "14deg"
  },
  {
    title: "Titan Low",
    subtitle: "Deep frontier mystery",
    genre: "Mystery",
    progress: 33,
    description: "Steige unter die Oberfläche eines fremden Mondes und entschlüssele Signale, die älter sind als dein Sonnensystem.",
    launch: "Tiefenscanner aktiv · Druckkammer versiegelt · Signal erfasst",
    accentA: "rgba(80, 145, 255, 0.9)",
    accentB: "rgba(0, 255, 180, 0.78)",
    tilt: "-4deg"
  },
  {
    title: "Lumen Forge",
    subtitle: "Creative build universe",
    genre: "Creative",
    progress: 86,
    description: "Baue schillernde Städte aus Licht, teile sie im Cloud-Verbund und betrete die Welten deiner Freunde nahtlos.",
    launch: "Lichtwerkzeuge geladen · Cloud-Welt verbunden · Forge erwacht",
    accentA: "rgba(255, 215, 95, 0.9)",
    accentB: "rgba(155, 80, 255, 0.86)",
    tilt: "18deg"
  },
  {
    title: "Arctic Signal",
    subtitle: "Co-op mystery expedition",
    genre: "Co-op",
    progress: 9,
    description: "Folge einem Signal unter dem Eis, während adaptive Haptik Wind, Druck und Entfernung spürbar macht.",
    launch: "Expedition startet · Eisradar aktiv · Ko-op Kanal verbunden",
    accentA: "rgba(160, 250, 255, 0.92)",
    accentB: "rgba(55, 100, 255, 0.88)",
    tilt: "-15deg"
  }
];

const storeItems = ["Crystal Horizon", "Solar Choir", "Midnight Atlas", "Velvet Reactor", "Zero Tide", "Glass Monarch"];
const friends = ["Mira", "Onyx", "Kade", "Nova", "Rune", "Ari", "Sol", "Vex"];
const feed = [
  ["✦", "Cloud Gallery", "18 neue Captures wurden für Cinematic Share optimiert."],
  ["◇", "System Update", "Aurora OS hat neue Motion-Blur- und Glass-Layer-Effekte erhalten."],
  ["●", "Party Invite", "Mira lädt dich zu Echo Runner ein."],
  ["△", "Achievement", "Lumen Forge: Skyline aus reinem Licht gebaut."],
  ["◌", "Store Drop", "Crystal Horizon ist als fiktives Showcase im Store verfügbar."]
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const carousel = $("#gameCarousel");
const libraryGrid = $("#libraryGrid");
const storeGrid = $("#storeGrid");
const friendsGrid = $("#friendsGrid");
const pulseFeed = $("#pulseFeed");
const featuredTitle = $("#featuredTitle");
const featuredDescription = $("#featuredDescription");
const featuredCover = $("#featuredCover");
const featuredChip = $("#featuredChip");
const questText = $("#questText");
const clock = $("#clock");
const nowPlaying = $(".now-playing");
const bootScreen = $("#bootScreen");
const enterButton = $("#enterButton");
const launchOverlay = $("#launchOverlay");
const launchTitle = $("#launchTitle");
const launchSubtitle = $("#launchSubtitle");
const launchMeter = $("#launchMeter");
const toast = $("#toast");
const profileModal = $("#profileModal");
const detailsModal = $("#detailsModal");
const profileButton = $("#profileButton");
const avatarUpload = $("#avatarUpload");
const avatarImage = $("#avatarImage");
const avatarText = $("#avatarText");
const profilePreview = $("#profilePreview");
const profileName = $("#profileName");
const profileStatus = $("#profileStatus");

let selectedIndex = 0;
let toastTimer;

function cardMarkup(game, index, mode = "carousel") {
  return `
    <button class="${mode === "library" ? "library-tile" : "game-card"} ${index === selectedIndex ? "selected" : ""}" type="button" data-game-index="${index}" style="--accent-a: ${game.accentA}; --accent-b: ${game.accentB}; --tilt: ${game.tilt}">
      ${mode === "library" ? `
        <div class="tile-content">
          <span class="chip">${game.genre} · ${game.progress}%</span>
          <h3>${game.title}</h3>
          <p>${game.subtitle}</p>
          <div class="tile-actions">
            <span class="small-button">Starten</span>
            <span class="small-button">Details</span>
          </div>
        </div>` : `
        <div class="game-visual" aria-hidden="true"><span></span><i></i></div>
        <div class="game-info"><h3>${game.title}</h3><p>${game.subtitle}</p></div>`}
    </button>
  `;
}

function renderGames() {
  carousel.innerHTML = games.map((game, index) => cardMarkup(game, index)).join("");
  libraryGrid.innerHTML = games.map((game, index) => cardMarkup(game, index, "library")).join("");

  $$('[data-game-index]').forEach((card) => {
    card.addEventListener("click", () => {
      const index = Number(card.dataset.gameIndex);
      selectGame(index, true);
      if (card.classList.contains("library-tile")) startGame(index);
    });
    card.addEventListener("dblclick", () => startGame(Number(card.dataset.gameIndex)));
    card.addEventListener("pointermove", handleCardTilt);
    card.addEventListener("pointerleave", resetCardTilt);
  });
}

function renderStore() {
  storeGrid.innerHTML = storeItems.map((title, index) => {
    const a = games[index % games.length].accentA;
    const b = games[index % games.length].accentB;
    return `
      <button class="store-tile" type="button" data-toast="${title} wurde zur Wunschliste hinzugefügt." style="--accent-a: ${a}; --accent-b: ${b}">
        <div class="tile-content">
          <span class="chip">Store Preview</span>
          <h3>${title}</h3>
          <p>Fiktives Premium-Spiel · Trailer · Wunschliste</p>
          <div class="tile-actions"><span class="small-button">Wishlist</span><span class="small-button">Trailer</span></div>
        </div>
      </button>
    `;
  }).join("");
}

function renderSocialAndPulse() {
  friendsGrid.innerHTML = friends.map((name, index) => `
    <button class="friend-card" type="button" data-toast="Einladung an ${name} gesendet.">
      <span class="friend-avatar">${name.slice(0, 2).toUpperCase()}</span>
      <div><h3>${name}</h3><p>${index % 2 ? "In Library" : "Online · bereit für Party"}</p></div>
      <span class="small-button">Einladen</span>
    </button>
  `).join("");

  pulseFeed.innerHTML = feed.map(([icon, title, text]) => `
    <button class="feed-card" type="button" data-toast="${title} geöffnet.">
      <span class="feed-badge">${icon}</span>
      <div><h3>${title}</h3><p>${text}</p></div>
      <span class="small-button">Öffnen</span>
    </button>
  `).join("");
}

function selectGame(index, scrollIntoView = false) {
  selectedIndex = (index + games.length) % games.length;
  const game = games[selectedIndex];

  featuredTitle.textContent = game.title;
  featuredDescription.textContent = game.description;
  featuredChip.textContent = `${game.genre} · ${game.progress}% Complete`;
  questText.textContent = `${game.title} · ${game.progress}% abgeschlossen`;
  featuredCover.style.background = `radial-gradient(circle at 42% 34%, rgba(255, 255, 255, 0.2), transparent 11%), linear-gradient(145deg, ${game.accentB}, ${game.accentA})`;

  $$('[data-game-index]').forEach((card) => {
    const isSelected = Number(card.dataset.gameIndex) === selectedIndex;
    card.classList.toggle("selected", isSelected);
    if (scrollIntoView && isSelected && card.closest("#gameCarousel")) {
      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  });
}

function switchView(viewName) {
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === `view-${viewName}`));
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  showToast(`${viewName[0].toUpperCase()}${viewName.slice(1)} geöffnet.`);
}

function startGame(index = selectedIndex) {
  const game = games[index];
  selectGame(index, true);
  launchTitle.textContent = game.title;
  launchSubtitle.textContent = game.launch;
  launchOverlay.style.setProperty("--cyan", game.accentA);
  launchOverlay.style.setProperty("--violet", game.accentB);
  launchOverlay.classList.add("active");
  launchMeter.style.width = "0";

  requestAnimationFrame(() => {
    launchMeter.style.width = "100%";
  });

  window.setTimeout(() => {
    launchSubtitle.textContent = "Demo: Spiel wäre jetzt gestartet. Zurück zum Dashboard...";
  }, 1200);

  window.setTimeout(() => {
    launchOverlay.classList.remove("active");
    launchMeter.style.width = "0";
  }, 2450);
}

function openDetails() {
  const game = games[selectedIndex];
  $("#detailsTitle").textContent = game.title;
  $("#detailsText").textContent = `${game.description} Genre: ${game.genre}. Fortschritt: ${game.progress}%. Launch-Intro: ${game.launch}.`;
  detailsModal.showModal();
}

function handleCardTilt(event) {
  const card = event.currentTarget;
  if (!card.classList.contains("game-card")) return;
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
  clock.textContent = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function addPointerGlow() {
  if (!nowPlaying) return;
  nowPlaying.addEventListener("pointermove", (event) => {
    const rect = nowPlaying.getBoundingClientRect();
    nowPlaying.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    nowPlaying.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1900);
}

function saveProfile(event) {
  event.preventDefault();
  const name = profileName.value.trim() || "Player";
  avatarText.textContent = name.slice(0, 2).toUpperCase();
  profileModal.close();
  showToast(`Profil gespeichert: ${name} · ${profileStatus.value.trim() || "Online"}`);
}

function handleAvatarUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    avatarImage.src = reader.result;
    profileButton.classList.add("has-image");
    profilePreview.innerHTML = `<img src="${reader.result}" alt="Profilbild Vorschau" />`;
    showToast("Profilbild geladen.");
  };
  reader.readAsDataURL(file);
}

function initNavigation() {
  $$('[data-view]').forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  $$('[data-action="continue"]').forEach((button) => button.addEventListener("click", () => startGame(selectedIndex)));
  $$('[data-toast]').forEach((button) => button.addEventListener("click", () => showToast(button.dataset.toast)));

  $("#playButton").addEventListener("click", () => startGame(selectedIndex));
  $("#detailsPlay").addEventListener("click", () => {
    detailsModal.close();
    startGame(selectedIndex);
  });
  $("#detailsButton").addEventListener("click", openDetails);
  $("#profileButton").addEventListener("click", () => profileModal.showModal());
  $("#saveProfile").addEventListener("click", saveProfile);
  avatarUpload.addEventListener("change", handleAvatarUpload);
  $("#searchButton").addEventListener("click", () => showToast("Suche geöffnet: tippe später nach Spielen, Freunden oder Store-Items."));
  enterButton.addEventListener("click", () => bootScreen.classList.add("hidden"));

  setTimeout(() => bootScreen.classList.add("hidden"), 2800);
}

window.addEventListener("keydown", (event) => {
  if (profileModal.open || detailsModal.open) return;
  if (event.key === "ArrowRight") selectGame(selectedIndex + 1, true);
  if (event.key === "ArrowLeft") selectGame(selectedIndex - 1, true);
  if (event.key === "Enter") startGame(selectedIndex);
  if (event.key === "Escape") launchOverlay.classList.remove("active");
});

renderGames();
renderStore();
renderSocialAndPulse();
selectGame(0);
updateClock();
addPointerGlow();
initNavigation();
setInterval(updateClock, 30_000);
