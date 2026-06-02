(() => {
  const MEDIA_KEY = 'aos-media-v2';
  const $ = (selector) => document.querySelector(selector);

  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function notify(message) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2300);
  }

  function fallbackImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#cfd7e1');
    gradient.addColorStop(0.55, '#edf5fc');
    gradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111722';
    ctx.font = '900 72px Inter, sans-serif';
    ctx.fillText('AURORA', 70, 125);
    ctx.font = '800 36px Inter, sans-serif';
    ctx.fillStyle = '#c29d12';
    ctx.fillText('SCREENSHOT', 70, 180);
    ctx.fillStyle = '#ffffffcc';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.roundRect(70 + i * 135, 245, 105, 170, 16);
      ctx.fill();
    }
    ctx.fillStyle = '#0a83cf';
    ctx.font = '700 26px Inter, sans-serif';
    ctx.fillText(new Date().toLocaleString('de-DE'), 70, 475);
    return canvas.toDataURL('image/png');
  }

  async function captureScreen() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      return fallbackImage();
    }
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();
    await new Promise((resolve) => setTimeout(resolve, 250));
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stream.getTracks().forEach((track) => track.stop());
    return canvas.toDataURL('image/png');
  }

  async function realScreenshot() {
    try {
      const image = await captureScreen();
      const shots = read(MEDIA_KEY, []);
      shots.unshift({
        time: new Date().toISOString(),
        screen: document.querySelector('.meta h2')?.textContent || 'Aurora Home',
        image
      });
      write(MEDIA_KEY, shots.slice(0, 50));
      notify('Echter Screenshot gespeichert');
      enhanceMedia();
    } catch (error) {
      const shots = read(MEDIA_KEY, []);
      shots.unshift({
        time: new Date().toISOString(),
        screen: document.querySelector('.meta h2')?.textContent || 'Aurora Home',
        image: fallbackImage()
      });
      write(MEDIA_KEY, shots.slice(0, 50));
      notify('Screenshot-Fallback gespeichert');
      enhanceMedia();
    }
  }

  function showControls() {
    document.querySelector('#enhancePanel')?.remove();
    const panel = document.createElement('div');
    panel.id = 'enhancePanel';
    panel.className = 'panel';
    panel.innerHTML = `
      <h2>Controls</h2>
      <span class="status-pill">Controller ready</span>
      <div class="card">
        <div class="control-grid">
          <div class="control-key"><span>← / →</span><b>Spiel wechseln</b></div>
          <div class="control-key"><span>Enter</span><b>Start / Kaufen</b></div>
          <div class="control-key"><span>F</span><b>Echter Screenshot</b></div>
          <div class="control-key"><span>Esc</span><b>Panel schließen</b></div>
          <div class="control-key"><span>C</span><b>Controls</b></div>
          <div class="control-key"><span>H</span><b>Home</b></div>
        </div>
      </div>
      <div class="card"><b>Screenshot-Modus</b><p>Beim ersten Mal fragt der Browser, welchen Bildschirm oder Tab du aufnehmen möchtest.</p></div>
      <button data-enhance-close>Schließen</button>`;
    document.body.appendChild(panel);
  }

  function enhanceTopbar() {
    const left = document.querySelector('.left');
    if (!left || left.querySelector('[data-controls-upgrade]')) return;
    const btn = document.createElement('button');
    btn.dataset.controlsUpgrade = 'true';
    btn.textContent = '🎛 Controls';
    btn.addEventListener('click', showControls);
    left.appendChild(btn);
  }

  function enhanceMedia() {
    const mediaTitle = [...document.querySelectorAll('.welcome h1')].find((el) => el.textContent.trim() === 'Media');
    if (!mediaTitle) return;
    const shots = read(MEDIA_KEY, []);
    const cards = document.querySelectorAll('.grid .card');
    cards.forEach((card, index) => {
      const shot = shots[index];
      if (!shot || !shot.image || card.querySelector('img')) return;
      card.classList.add('media-shot');
      const img = document.createElement('img');
      img.src = shot.image;
      img.alt = 'Screenshot';
      card.prepend(img);
    });
  }

  function goHome() {
    const allTab = [...document.querySelectorAll('[data-tab]')].find((button) => button.dataset.tab === 'games');
    allTab?.click();
  }

  window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      event.stopImmediatePropagation();
      realScreenshot();
    }
    if (event.key.toLowerCase() === 'c') {
      event.preventDefault();
      showControls();
    }
    if (event.key.toLowerCase() === 'h') {
      event.preventDefault();
      goHome();
    }
  }, true);

  document.body.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="shot"]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      realScreenshot();
    }
    if (event.target.closest('[data-enhance-close]')) {
      document.querySelector('#enhancePanel')?.remove();
    }
  }, true);

  const observer = new MutationObserver(() => {
    enhanceTopbar();
    enhanceMedia();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => {
    enhanceTopbar();
    enhanceMedia();
  }, 500);
})();
