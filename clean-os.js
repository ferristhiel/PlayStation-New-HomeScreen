(() => {
  const games = [
    { id: 'ferris', title: 'Ferris Game', sub: 'Playable GitHub Pages game', url: 'https://ferristhiel.github.io/Game/', mb: 1200, price: 0, cat: 'Adventure', a: '#151923', b: '#505b6d' },
    { id: 'retro', title: 'Retro Pixel Game', sub: 'Retro pixel adventure', url: 'https://ferristhiel.github.io/Retro-Pixel-Game/', mb: 640, price: 0, cat: 'Arcade', a: '#ffcc28', b: '#7d4cff' },
    { id: 'three', title: '3D Game', sub: '3D browser world', url: 'https://ferristhiel.github.io/3D-Game/', mb: 1800, price: 0, cat: 'Adventure', a: '#2299ff', b: '#00dcb4' },
    { id: 'echo', title: 'Echo Runner', sub: 'Hyper speed cyber racing', mb: 4200, price: 19.99, cat: 'Racing', a: '#f94a42', b: '#9d1d2b' },
    { id: 'void', title: 'Void Garden', sub: 'Dreamlike horror strategy', mb: 2600, price: 0, cat: 'Horror', a: '#6d42ff', b: '#1ec9ff' },
    { id: 'forge', title: 'Lumen Forge', sub: 'Creative build universe', mb: 5200, price: 29.99, cat: 'Creative', a: '#ff7a1f', b: '#ff2b79' },
    { id: 'arctic', title: 'Arctic Signal', sub: 'Co-op mystery expedition', mb: 3400, price: 14.99, cat: 'Horror', a: '#b8e8ff', b: '#4362ff' }
  ];

  const systemTiles = [
    { kind: 'store', title: 'Store', sub: 'Discover games', a: '#eaf2fb', b: '#ffffff', icon: '🛒' },
    { kind: 'plus', title: 'Aurora+', sub: 'Game pass', a: '#111722', b: '#42506a', icon: '✦' }
  ];

  const $ = (selector) => document.querySelector(selector);
  const state = { selected: 2, view: 'home', storeFilter: 'Featured' };
  const keys = {
    installed: 'aos-installed-v3', downloads: 'aos-downloads-v3', users: 'aos-users-v3',
    activeUser: 'aurora-console-active-user-v1', media: 'aos-media-v3', wish: 'aos-wish-v3',
    cart: 'aos-cart-v3', dark: 'aos-dark-v3'
  };

  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const now = () => new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const getUser = () => read(keys.activeUser, { name: 'Ferro', avatar: '⚡' });

  function installed() {
    let value = read(keys.installed, null);
    if (!value) { value = { ferris: true }; write(keys.installed, value); }
    return value;
  }
  const isInstalled = (id) => Boolean(installed()[id]);
  function markInstalled(id) { const value = installed(); value[id] = true; write(keys.installed, value); }
  const downloads = () => read(keys.downloads, {});
  const setDownloads = (value) => write(keys.downloads, value);

  function toast(message) {
    document.querySelector('.toast')?.remove();
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }

  function panel(html) {
    closePanel();
    const node = document.createElement('div');
    node.className = 'panel';
    node.id = 'panel';
    node.innerHTML = html;
    document.body.appendChild(node);
  }
  function closePanel() { document.querySelector('#panel')?.remove(); }

  function boot() {
    setInterval(() => {
      const loginClock = $('#loginClock');
      const live = $('#live');
      if (loginClock) loginClock.textContent = now();
      if (live) live.textContent = now();
    }, 1000);
    $('#loginClock').textContent = now();
    renderUsers();
    $('#bootBtn').addEventListener('click', () => showLogin());
    setTimeout(() => showLogin(), 1300);
  }

  function showLogin() {
    $('#boot').classList.add('hidden');
    setTimeout(() => $('#login').classList.remove('hidden'), 250);
  }

  function renderUsers() {
    const saved = read(keys.users, [{ name: 'Ferro', avatar: '⚡', main: true }]);
    const cards = [{ create: true }, ...saved, { guest: true }];
    const html = cards.map((user, index) => {
      const avatar = user.create ? '+' : user.guest ? '⚂' : user.avatar;
      const name = user.create ? 'Create User' : user.guest ? 'Play as Guest' : user.name;
      const text = user.create ? 'Add a new profile' : user.guest ? 'Temporary profile' : 'Main Account';
      return `<button class="user ${user.main ? 'selected' : ''}" data-user-index="${index}"><span class="avatar">${avatar}</span><h3>${name}</h3><p>${text}</p></button>`;
    }).join('');
    $('#users').innerHTML = html;
    $('#usersMirror').innerHTML = html;
    $('#users').onclick = (event) => {
      const button = event.target.closest('[data-user-index]');
      if (!button) return;
      const user = cards[Number(button.dataset.userIndex)];
      if (user.create) {
        const name = prompt('Name?');
        if (!name) return;
        saved.push({ name, avatar: name.slice(0, 2).toUpperCase() });
        write(keys.users, saved);
        renderUsers();
        return;
      }
      write(keys.activeUser, user.guest ? { name: 'Guest', avatar: '⚂' } : user);
      $('#login').classList.add('hidden');
      toast(`${user.name || 'Guest'} angemeldet`);
      render();
    };
  }

  function topbar() {
    const user = getUser();
    return `<div class="top top-min"><div class="left"><span id="live">${now()}</span></div><div></div><div class="right"><button data-action="media">Media</button><button data-action="friends">👥</button><button data-action="profile">${user.avatar} ${user.name}</button><button data-action="settings">⚙</button></div></div>`;
  }

  function libraryItems() { return [...systemTiles, ...games.map((game) => ({ kind: 'game', ...game }))]; }
  function selectedItem() { return libraryItems()[state.selected] || libraryItems()[0]; }

  function tile(item, index) {
    const selected = index === state.selected;
    if (item.kind === 'store' || item.kind === 'plus') {
      return `<button class="tile round-tile ${selected ? 'sel' : ''}" data-index="${index}" style="--a:${item.a};--b:${item.b}"><span class="cover system-cover"><span class="sym">${item.icon}</span><h3 class="name">${item.title}</h3><span class="enter">Open</span></span></button>`;
    }
    const activeDownloads = downloads();
    const down = activeDownloads[item.id];
    const ready = isInstalled(item.id);
    const classes = `${selected ? 'sel' : ''} ${!ready && !down ? 'locked' : ''} ${down ? 'down' : ''}`;
    const symbol = ready ? '▶' : down ? '⬇' : '▣';
    const progress = down ? `<span class="bar" style="--p:${down.progress}%"><i></i></span>` : `<span class="enter">${ready ? 'Start' : item.price ? 'Buy' : 'Free'}</span>`;
    return `<button class="tile ${classes}" data-index="${index}" style="--a:${item.a};--b:${item.b}"><span class="cover"><span class="sym">${symbol}</span><h3 class="name">${item.title}</h3>${progress}</span></button>`;
  }

  function renderHome() {
    const items = libraryItems();
    const item = selectedItem();
    const activeDownloads = downloads();
    let description = item.sub;
    let action = 'Öffnen';
    if (item.kind === 'game') {
      const down = activeDownloads[item.id];
      const ready = isInstalled(item.id);
      description = ready ? item.sub : down ? `Download ${down.progress}% · ${Math.round(item.mb * (1 - down.progress / 100))} MB übrig` : item.price ? `${item.price.toFixed(2)} € · Store` : `Free Download · ${item.mb} MB`;
      action = ready ? 'Spiel starten' : down ? 'Status' : item.price ? 'Kaufen' : 'Free Download';
    }
    $('#app').innerHTML = `${topbar()}<section class="main"><div class="welcome"><h1>Welcome</h1><p>△○×□</p></div><div class="shelf"><div class="row">${items.map(tile).join('')}</div><div class="mirror">${items.map(tile).join('')}</div><div class="meta"><h2>${item.title}</h2><p>${description}</p><button data-action="open-selected">${action}</button> <button class="secondary" data-action="info">Infos</button></div></div></section>`;
  }

  function renderStore(mode = 'Featured') {
    state.view = 'store';
    state.storeFilter = mode;
    const wish = read(keys.wish, {});
    const cart = read(keys.cart, {});
    const categories = ['Featured', 'Adventure', 'Horror', 'Arcade', 'Racing', 'Creative', 'Wishlist', 'Cart'];
    let list = games;
    if (mode === 'Wishlist') list = games.filter((game) => wish[game.id]);
    else if (mode === 'Cart') list = games.filter((game) => cart[game.id]);
    else if (mode !== 'Featured') list = games.filter((game) => game.cat === mode);
    const hero = list[0] || games[0];
    const cards = list.map((game) => `<div class="store-card card"><span class="status-pill">${game.cat}</span><h2>${game.title}</h2><p>${game.sub}</p><p>${game.mb} MB · ${isInstalled(game.id) ? 'Installiert' : game.price ? `${game.price.toFixed(2)} €` : 'Free'}</p><button data-buy="${game.id}">${isInstalled(game.id) ? 'Installiert' : game.price ? 'In den Warenkorb / Kaufen' : 'Free Download'}</button> <button class="secondary" data-wish="${game.id}">${wish[game.id] ? '♥ Wunschliste' : '♡ Wunschliste'}</button> <button class="secondary" data-cart="${game.id}">${cart[game.id] ? '🛒 Im Wagen' : '🛒 Wagen'}</button></div>`).join('') || '<div class="card"><h2>Leer</h2><p>Hier ist noch nichts gespeichert.</p></div>';
    $('#app').innerHTML = `${topbar()}<section class="main store-main"><div class="store-hero card"><span class="status-pill">Premium Store</span><h1>${hero.title}</h1><p>${hero.sub}</p><button data-buy="${hero.id}">${hero.price ? 'Jetzt holen' : 'Gratis laden'}</button></div><div class="store-cats">${categories.map((cat) => `<button class="${cat === mode ? 'on' : ''}" data-store-filter="${cat}">${cat === 'Cart' ? '🛒 Einkaufswagen' : cat === 'Wishlist' ? '♥ Wunschliste' : cat}</button>`).join('')}</div><div class="grid">${cards}</div></section>`;
  }

  function renderMedia() {
    state.view = 'media';
    const shots = read(keys.media, []);
    const cards = shots.length ? shots.map((shot) => `<div class="card media-shot">${shot.image ? `<img src="${shot.image}" alt="Screenshot">` : ''}<div><h2>Screenshot</h2><p>${new Date(shot.time).toLocaleString('de-DE')}</p><p>${shot.screen}</p></div></div>`).join('') : '<div class="card"><h2>Noch keine Medien</h2><p>Drücke F für ein Foto.</p></div>';
    $('#app').innerHTML = `${topbar()}<section class="main"><div class="welcome"><h1>Media</h1><p>F = FOTO</p></div><div class="grid">${cards}</div></section>`;
  }

  function renderSettings() {
    state.view = 'settings';
    $('#app').innerHTML = `${topbar()}<section class="main"><div class="welcome"><h1>Settings</h1><p>SYSTEM / CONTROL</p></div><div class="grid"><div class="card"><h2>Clean Hintergrund</h2><p>${document.body.classList.contains('dark') ? 'Dunkel animiert' : 'Grau clean'}</p><button data-action="theme">Umschalten</button></div><div class="card"><h2>Controller & Tasten</h2><div class="control-grid"><div class="control-key"><span>← / →</span><b>Auswahl</b></div><div class="control-key"><span>Enter</span><b>Start</b></div><div class="control-key"><span>F</span><b>Screenshot</b></div><div class="control-key"><span>Esc</span><b>Zurück</b></div></div></div><div class="card"><h2>Downloads</h2><p>Status und Speicher ansehen.</p><button data-action="status">Öffnen</button></div></div></section>`;
  }

  function renderPlus() {
    state.view = 'plus';
    $('#app').innerHTML = `${topbar()}<section class="main"><div class="welcome"><h1>Aurora+</h1><p>GAME PASS</p></div><div class="grid"><div class="card"><span class="status-pill">Included</span><h2>Cloud Saves</h2><p>Synchronisiere Profile, Medien und Spielstände.</p></div><div class="card"><span class="status-pill">Monthly</span><h2>Free Games</h2><p>Jeden Monat neue fiktive Titel zum Laden.</p></div><div class="card"><span class="status-pill">Early</span><h2>Beta Access</h2><p>Früher Zugriff auf neue Welten.</p><button data-action="activate-plus">Aktivieren</button></div></div></section>`;
  }

  function render() {
    if (state.view === 'store') renderStore(state.storeFilter);
    else if (state.view === 'media') renderMedia();
    else if (state.view === 'settings') renderSettings();
    else if (state.view === 'plus') renderPlus();
    else renderHome();
  }

  function openSelected() {
    const item = selectedItem();
    if (item.kind === 'store') { renderStore(); return; }
    if (item.kind === 'plus') { renderPlus(); return; }
    if (isInstalled(item.id)) startGame(item);
    else if (downloads()[item.id]) showStatus();
    else startDownload(item);
  }

  function startDownload(game) {
    if (isInstalled(game.id)) { toast('Schon installiert'); return; }
    if (downloads()[game.id]) { showStatus(); return; }
    if (!confirm(`${game.price ? `${game.price.toFixed(2)} € kaufen` : 'Free Download'}: ${game.title}\n${game.mb} MB`)) return;
    const active = downloads();
    active[game.id] = { progress: 0 };
    setDownloads(active);
    toast(`${game.title} lädt herunter`);
    render();
    const timer = setInterval(() => {
      const next = downloads();
      if (!next[game.id]) { clearInterval(timer); return; }
      next[game.id].progress = Math.min(100, next[game.id].progress + 10 + Math.floor(Math.random() * 15));
      if (next[game.id].progress >= 100) {
        delete next[game.id]; setDownloads(next); markInstalled(game.id); clearInterval(timer); toast(`${game.title} ist installiert`); render(); return;
      }
      setDownloads(next); render();
    }, 650);
  }

  function startGame(game) {
    $('#launch').classList.remove('hidden');
    $('#launchTitle').textContent = game.title;
    $('#loadbar').style.width = '0';
    requestAnimationFrame(() => { $('#loadbar').style.width = '100%'; });
    setTimeout(() => {
      $('#launch').classList.add('hidden');
      if (game.url) { $('#gameTitle').textContent = game.title; $('#openTab').href = game.url; $('#gameFrame').src = game.url; $('#gamePlayer').classList.remove('hidden'); }
      else toast(`${game.title} Demo gestartet`);
    }, 1700);
  }

  function showStatus() {
    const entries = Object.entries(downloads());
    const html = entries.length ? entries.map(([id, down]) => { const game = games.find((x) => x.id === id); return `<div class="card"><b>${game.title}</b><p>${down.progress}% · ${Math.round(game.mb * (1 - down.progress / 100))} MB übrig</p><div class="line" style="--w:${down.progress}%"><i></i></div></div>`; }).join('') : '<p>Keine aktiven Downloads.</p>';
    panel(`<h2>Downloads</h2>${html}<button data-close-panel>Schließen</button>`);
  }

  async function takeShot() {
    let image = '';
    try {
      if (navigator.mediaDevices?.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        const video = document.createElement('video');
        video.srcObject = stream; await video.play(); await new Promise((r) => setTimeout(r, 200));
        const canvas = document.createElement('canvas'); canvas.width = video.videoWidth || 1280; canvas.height = video.videoHeight || 720;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height); stream.getTracks().forEach((t) => t.stop()); image = canvas.toDataURL('image/png');
      }
    } catch {}
    const shots = read(keys.media, []);
    shots.unshift({ time: new Date().toISOString(), screen: selectedItem().title || state.view, image });
    write(keys.media, shots.slice(0, 50)); toast(image ? 'Echter Screenshot gespeichert' : 'Screenshot gespeichert'); if (state.view === 'media') renderMedia();
  }

  function showProfile() { const user = getUser(); panel(`<h2>${user.name}</h2><div class="card"><b>Status</b><p>Online · ${now()}</p></div><div class="card"><b>Media</b><p>${read(keys.media, []).length} Screenshots</p></div><button data-action="friends">Freunde</button> <button data-action="settings">Settings</button>`); }
  function showFriends() { panel(`<h2>Freunde</h2>${['Mira','Onyx','Kade','Nova'].map((name) => `<div class="card"><b>${name}</b><p>Online</p><button data-invite="${name}">Einladen</button></div>`).join('')}`); }
  function showInfo() { const item = selectedItem(); panel(`<h2>${item.title}</h2><div class="card"><p>${item.sub}</p><p>${item.kind === 'game' ? `${item.mb} MB · ${item.cat}` : 'System App'}</p></div>`); }

  function handleClick(event) {
    const userButton = event.target.closest('[data-user-index]'); if (userButton) return;
    const indexButton = event.target.closest('[data-index]'); if (indexButton) { const index = Number(indexButton.dataset.index); if (index === state.selected) openSelected(); else { state.selected = index; state.view = 'home'; renderHome(); } return; }
    const filterButton = event.target.closest('[data-store-filter]'); if (filterButton) { renderStore(filterButton.dataset.storeFilter); return; }
    const buy = event.target.closest('[data-buy]'); if (buy) { startDownload(games.find((g) => g.id === buy.dataset.buy)); return; }
    const wish = event.target.closest('[data-wish]'); if (wish) { const value = read(keys.wish, {}); value[wish.dataset.wish] = !value[wish.dataset.wish]; write(keys.wish, value); renderStore(state.storeFilter); return; }
    const cart = event.target.closest('[data-cart]'); if (cart) { const value = read(keys.cart, {}); value[cart.dataset.cart] = !value[cart.dataset.cart]; write(keys.cart, value); renderStore(state.storeFilter); return; }
    if (event.target.closest('[data-close-panel]')) closePanel();
    const invite = event.target.closest('[data-invite]'); if (invite) toast(`Einladung an ${invite.dataset.invite} gesendet`);
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    if (action === 'open-selected') openSelected();
    if (action === 'info') showInfo();
    if (action === 'media') renderMedia();
    if (action === 'settings') renderSettings();
    if (action === 'friends') showFriends();
    if (action === 'profile') showProfile();
    if (action === 'status') showStatus();
    if (action === 'theme') { document.body.classList.toggle('dark'); write(keys.dark, document.body.classList.contains('dark')); renderSettings(); }
    if (action === 'activate-plus') toast('Aurora+ Demo aktiviert');
  }

  function init() {
    if (read(keys.dark, false)) document.body.classList.add('dark');
    document.body.addEventListener('click', handleClick);
    $('#bootBtn').addEventListener('click', showLogin);
    $('#closeGame').addEventListener('click', () => { $('#gamePlayer').classList.add('hidden'); $('#gameFrame').src = 'about:blank'; });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') { state.selected = (state.selected + 1) % libraryItems().length; state.view = 'home'; renderHome(); }
      if (event.key === 'ArrowLeft') { state.selected = (state.selected - 1 + libraryItems().length) % libraryItems().length; state.view = 'home'; renderHome(); }
      if (event.key === 'Enter') openSelected();
      if (event.key.toLowerCase() === 'f') takeShot();
      if (event.key === 'Escape') { closePanel(); state.view = 'home'; renderHome(); }
    });
    setInterval(() => { const live = $('#live'); const clock = $('#loginClock'); if (live) live.textContent = now(); if (clock) clock.textContent = now(); }, 1000);
    $('#loginClock').textContent = now(); renderUsers(); renderHome(); setTimeout(showLogin, 1300);
  }
  init();
})();
