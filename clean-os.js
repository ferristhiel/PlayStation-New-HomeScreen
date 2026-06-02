(() => {
  const games = [
    { id: 'ferris', title: 'Ferris Game', sub: 'Playable GitHub Pages game', url: 'https://ferristhiel.github.io/Game/', mb: 1200, price: 0, a: '#151923', b: '#505b6d' },
    { id: 'retro', title: 'Retro Pixel Game', sub: 'Retro pixel adventure', url: 'https://ferristhiel.github.io/Retro-Pixel-Game/', mb: 640, price: 0, a: '#ffcc28', b: '#7d4cff' },
    { id: 'three', title: '3D Game', sub: '3D browser world', url: 'https://ferristhiel.github.io/3D-Game/', mb: 1800, price: 0, a: '#2299ff', b: '#00dcb4' },
    { id: 'echo', title: 'Echo Runner', sub: 'Hyper speed racing', mb: 4200, price: 19.99, a: '#f94a42', b: '#9d1d2b' },
    { id: 'void', title: 'Void Garden', sub: 'Dream strategy world', mb: 2600, price: 0, a: '#6d42ff', b: '#1ec9ff' },
    { id: 'forge', title: 'Lumen Forge', sub: 'Creative build universe', mb: 5200, price: 29.99, a: '#ff7a1f', b: '#ff2b79' }
  ];

  const $ = (selector) => document.querySelector(selector);
  const store = {
    installed: 'aos-installed-v2',
    downloads: 'aos-downloads-v2',
    users: 'aos-users-v2',
    activeUser: 'aurora-console-active-user-v1',
    media: 'aos-media-v2',
    wish: 'aos-wish-v2',
    cart: 'aos-cart-v2',
    dark: 'aos-dark-v2'
  };

  let selected = 0;
  let currentTab = 'games';
  const downloadTimers = new Map();

  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function now() {
    return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  function getInstalled() {
    let installed = read(store.installed, null);
    if (!installed) {
      installed = { ferris: true };
      write(store.installed, installed);
    }
    return installed;
  }

  function isInstalled(id) {
    return Boolean(getInstalled()[id]);
  }

  function markInstalled(id) {
    const installed = getInstalled();
    installed[id] = true;
    write(store.installed, installed);
  }

  function getDownloads() {
    return read(store.downloads, {});
  }

  function setDownloads(downloads) {
    write(store.downloads, downloads);
  }

  function getUser() {
    return read(store.activeUser, { name: 'Ferro', avatar: '⚡' });
  }

  function toast(message) {
    const oldToast = $('.toast');
    if (oldToast) oldToast.remove();
    const toastNode = document.createElement('div');
    toastNode.className = 'toast';
    toastNode.textContent = message;
    document.body.appendChild(toastNode);
    setTimeout(() => toastNode.remove(), 2200);
  }

  function showPanel(html) {
    closePanel();
    const panel = document.createElement('div');
    panel.id = 'panel';
    panel.className = 'panel';
    panel.innerHTML = html;
    document.body.appendChild(panel);
  }

  function closePanel() {
    const panel = $('#panel');
    if (panel) panel.remove();
  }

  function renderUsers() {
    const savedUsers = read(store.users, [{ name: 'Ferro', avatar: '⚡', main: true }]);
    const cards = [{ create: true }, ...savedUsers, { guest: true }];
    const html = cards.map((user, index) => {
      const avatar = user.create ? '+' : user.guest ? '⚂' : user.avatar;
      const name = user.create ? 'Create User' : user.guest ? 'Play as Guest' : user.name;
      const text = user.create ? 'Add a new user' : user.guest ? 'Temporary profile' : 'Main Account';
      return `<button class="user ${user.main ? 'selected' : ''}" data-user-index="${index}"><span class="avatar">${avatar}</span><h3>${name}</h3><p>${text}</p></button>`;
    }).join('');

    $('#users').innerHTML = html;
    $('#usersMirror').innerHTML = html;

    $('#users').addEventListener('click', (event) => {
      const button = event.target.closest('[data-user-index]');
      if (!button) return;
      const user = cards[Number(button.dataset.userIndex)];
      if (user.create) {
        const name = prompt('Name?');
        if (!name) return;
        savedUsers.push({ name, avatar: name.slice(0, 2).toUpperCase() });
        write(store.users, savedUsers);
        renderUsers();
        return;
      }
      write(store.activeUser, user.guest ? { name: 'Guest', avatar: '⚂' } : user);
      $('#login').classList.add('hidden');
      toast(`${user.name || 'Guest'} angemeldet`);
      renderApp();
    }, { once: true });
  }

  function renderTop() {
    const user = getUser();
    const tab = (name, label) => `<button class="${currentTab === name ? 'on' : ''}" data-tab="${name}">${label}</button>`;
    return `<div class="top"><div class="left"><span id="live">${now()}</span><button data-action="shot">📷 F</button><button data-action="status">⬇ Status</button></div><div class="tabs">${tab('media', 'Media')}${tab('games', 'All')}${tab('store', 'Store')}<button data-action="plus">Aurora+</button>${tab('settings', 'Settings')}</div><div class="right"><button data-action="friends">👥</button><button data-action="profile">${user.avatar} ${user.name}</button></div></div>`;
  }

  function renderTile(game, index) {
    const downloads = getDownloads();
    const download = downloads[game.id];
    const installed = isInstalled(game.id);
    const stateClass = `${index === selected ? 'sel' : ''} ${!installed && !download ? 'locked' : ''} ${download ? 'down' : ''}`;
    const symbol = installed ? '▶' : download ? '⬇' : '▣';
    const label = installed ? 'Enter' : game.price ? 'Buy' : 'Free';
    const progress = download ? `<span class="bar" style="--p:${download.progress}%"><i></i></span>` : `<span class="enter">${label}</span>`;
    return `<button class="tile ${stateClass}" data-game-index="${index}" style="--a:${game.a};--b:${game.b}"><span class="cover"><span class="sym">${symbol}</span><h3 class="name">${game.title}</h3>${progress}</span></button>`;
  }

  function renderGames() {
    const game = games[selected];
    const download = getDownloads()[game.id];
    const installed = isInstalled(game.id);
    const status = installed ? game.sub : download ? `Download ${download.progress}% · ${Math.round(game.mb * (1 - download.progress / 100))} MB übrig` : game.price ? `${game.price.toFixed(2)} € · Store` : `Free Download · ${game.mb} MB`;
    const action = installed ? 'Spiel starten' : download ? 'Status' : game.price ? 'Kaufen' : 'Free Download';

    $('#app').innerHTML = `${renderTop()}<section class="main"><div class="welcome"><h1>Welcome</h1><p>△○×□</p></div><div class="shelf"><div class="row">${games.map(renderTile).join('')}</div><div class="mirror">${games.map(renderTile).join('')}</div><div class="meta"><h2>${game.title}</h2><p>${status}</p><button data-action="main">${action}</button> <button class="secondary" data-action="info">Infos</button></div></div></section>`;
  }

  function renderStore() {
    const wish = read(store.wish, {});
    const cart = read(store.cart, {});
    const cards = games.map((game) => {
      const installed = isInstalled(game.id);
      const label = installed ? 'Installiert' : game.price ? 'Kaufen' : 'Free Download';
      return `<div class="card"><h2>${game.title}</h2><p>${game.sub}</p><p>${game.mb} MB · ${installed ? 'Installiert' : game.price ? `${game.price.toFixed(2)} €` : 'Free'}</p><button data-buy="${game.id}">${label}</button> <button class="secondary" data-wish="${game.id}">${wish[game.id] ? '♥' : '♡'}</button> <button class="secondary" data-cart="${game.id}">${cart[game.id] ? '🛒✓' : '🛒'}</button></div>`;
    }).join('');
    $('#app').innerHTML = `${renderTop()}<section class="main"><div class="welcome"><h1>Store</h1><p>🛒 ♥ DOWNLOAD</p></div><div class="grid">${cards}</div></section>`;
  }

  function renderMedia() {
    const shots = read(store.media, []);
    const cards = shots.length ? shots.map((shot) => `<div class="card"><h2>Screenshot</h2><p>${new Date(shot.time).toLocaleString('de-DE')}</p><p>${shot.screen}</p></div>`).join('') : '<div class="card"><h2>Noch keine Medien</h2><p>Drücke F für ein Foto.</p></div>';
    $('#app').innerHTML = `${renderTop()}<section class="main"><div class="welcome"><h1>Media</h1><p>F = FOTO</p></div><div class="grid">${cards}</div></section>`;
  }

  function renderSettings() {
    $('#app').innerHTML = `${renderTop()}<section class="main"><div class="welcome"><h1>Settings</h1><p>CLEAN / DARK</p></div><div class="grid"><div class="card"><h2>Clean Hintergrund</h2><p>${document.body.classList.contains('dark') ? 'Dunkel' : 'Weiß clean'}</p><button data-action="theme">Umschalten</button></div><div class="card"><h2>Downloads</h2><p>Status und Speicher ansehen.</p><button data-action="status">Öffnen</button></div><div class="card"><h2>Shortcuts</h2><p>F = Foto, Enter = Start, Pfeile = Auswahl.</p></div></div></section>`;
  }

  function renderApp() {
    if (currentTab === 'store') renderStore();
    else if (currentTab === 'media') renderMedia();
    else if (currentTab === 'settings') renderSettings();
    else renderGames();
  }

  function startDownload(game) {
    if (isInstalled(game.id)) {
      toast('Schon installiert');
      return;
    }
    if (getDownloads()[game.id]) {
      showStatus();
      return;
    }
    const accepted = confirm(`${game.price ? `${game.price.toFixed(2)} € kaufen` : 'Free Download'}: ${game.title}\n${game.mb} MB`);
    if (!accepted) return;

    const downloads = getDownloads();
    downloads[game.id] = { progress: 0 };
    setDownloads(downloads);
    toast(`${game.title} lädt herunter`);
    renderApp();

    const timer = setInterval(() => {
      const activeDownloads = getDownloads();
      if (!activeDownloads[game.id]) {
        clearInterval(timer);
        return;
      }
      activeDownloads[game.id].progress = Math.min(100, activeDownloads[game.id].progress + 10 + Math.floor(Math.random() * 15));
      if (activeDownloads[game.id].progress >= 100) {
        delete activeDownloads[game.id];
        setDownloads(activeDownloads);
        markInstalled(game.id);
        clearInterval(timer);
        toast(`${game.title} ist installiert`);
        renderApp();
        return;
      }
      setDownloads(activeDownloads);
      renderApp();
    }, 650);
    downloadTimers.set(game.id, timer);
  }

  function mainAction() {
    const game = games[selected];
    if (isInstalled(game.id)) startGame(game);
    else if (getDownloads()[game.id]) showStatus();
    else startDownload(game);
  }

  function startGame(game) {
    $('#launch').classList.remove('hidden');
    $('#launchTitle').textContent = game.title;
    $('#loadbar').style.width = '0';
    requestAnimationFrame(() => { $('#loadbar').style.width = '100%'; });
    setTimeout(() => {
      $('#launch').classList.add('hidden');
      if (game.url) {
        $('#gameTitle').textContent = game.title;
        $('#openTab').href = game.url;
        $('#gameFrame').src = game.url;
        $('#gamePlayer').classList.remove('hidden');
      } else {
        toast(`${game.title} Demo gestartet`);
      }
    }, 1700);
  }

  function showStatus() {
    const downloads = getDownloads();
    const entries = Object.entries(downloads);
    const html = entries.length ? entries.map(([id, download]) => {
      const game = games.find((entry) => entry.id === id);
      const left = Math.round(game.mb * (1 - download.progress / 100));
      return `<div class="card"><b>${game.title}</b><p>${download.progress}% · ${left} MB übrig</p><div class="line" style="--w:${download.progress}%"><i></i></div></div>`;
    }).join('') : '<p>Keine aktiven Downloads.</p>';
    showPanel(`<h2>Downloads</h2>${html}<button data-close-panel>Schließen</button>`);
  }

  function takeShot() {
    const shots = read(store.media, []);
    shots.unshift({ time: new Date().toISOString(), screen: games[selected]?.title || currentTab });
    write(store.media, shots.slice(0, 50));
    toast('Screenshot gespeichert');
    if (currentTab === 'media') renderMedia();
  }

  function showProfile() {
    const currentUser = getUser();
    showPanel(`<h2>${currentUser.name}</h2><div class="card"><b>Status</b><p>Online · ${now()}</p></div><div class="card"><b>Media</b><p>${read(store.media, []).length} Screenshots</p></div><button data-action="friends">Freunde</button> <button data-action="plus">Aurora+</button>`);
  }

  function showFriends() {
    showPanel(`<h2>Freunde</h2>${['Mira', 'Onyx', 'Kade', 'Nova'].map((name) => `<div class="card"><b>${name}</b><p>Online</p><button data-invite="${name}">Einladen</button></div>`).join('')}`);
  }

  function showPlus() {
    showPanel('<h2>Aurora+</h2><div class="card"><b>Game Pass</b><p>Cloud Saves · Free Games · Early Access</p></div><button data-action="activate-plus">Aktivieren</button>');
  }

  function showInfo() {
    const game = games[selected];
    showPanel(`<h2>${game.title}</h2><div class="card"><p>${game.sub}</p><p>${game.mb} MB</p><p>${isInstalled(game.id) ? 'Installiert' : 'Nicht installiert'}</p></div>`);
  }

  function handleClick(event) {
    const userButton = event.target.closest('[data-user-index]');
    if (userButton) return;

    const gameButton = event.target.closest('[data-game-index]');
    if (gameButton) {
      const index = Number(gameButton.dataset.gameIndex);
      if (index === selected) mainAction();
      else {
        selected = index;
        renderGames();
      }
      return;
    }

    const tabButton = event.target.closest('[data-tab]');
    if (tabButton) {
      currentTab = tabButton.dataset.tab;
      renderApp();
      return;
    }

    const buyButton = event.target.closest('[data-buy]');
    if (buyButton) {
      const game = games.find((entry) => entry.id === buyButton.dataset.buy);
      startDownload(game);
      return;
    }

    const wishButton = event.target.closest('[data-wish]');
    if (wishButton) {
      const wish = read(store.wish, {});
      wish[wishButton.dataset.wish] = !wish[wishButton.dataset.wish];
      write(store.wish, wish);
      renderStore();
      return;
    }

    const cartButton = event.target.closest('[data-cart]');
    if (cartButton) {
      const cart = read(store.cart, {});
      cart[cartButton.dataset.cart] = !cart[cartButton.dataset.cart];
      write(store.cart, cart);
      renderStore();
      return;
    }

    if (event.target.closest('[data-close-panel]')) closePanel();

    const inviteButton = event.target.closest('[data-invite]');
    if (inviteButton) toast(`Einladung an ${inviteButton.dataset.invite} gesendet`);

    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;
    const action = actionButton.dataset.action;
    if (action === 'main') mainAction();
    if (action === 'info') showInfo();
    if (action === 'shot') takeShot();
    if (action === 'status') showStatus();
    if (action === 'profile') showProfile();
    if (action === 'friends') showFriends();
    if (action === 'plus') showPlus();
    if (action === 'theme') {
      document.body.classList.toggle('dark');
      write(store.dark, document.body.classList.contains('dark'));
      renderSettings();
    }
    if (action === 'activate-plus') toast('Aurora+ Demo aktiviert');
  }

  function init() {
    if (read(store.dark, false)) document.body.classList.add('dark');
    document.body.addEventListener('click', handleClick);
    $('#bootBtn').addEventListener('click', () => {
      $('#boot').classList.add('hidden');
      setTimeout(() => $('#login').classList.remove('hidden'), 250);
    });
    $('#closeGame').addEventListener('click', () => {
      $('#gamePlayer').classList.add('hidden');
      $('#gameFrame').src = 'about:blank';
    });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        selected = (selected + 1) % games.length;
        if (currentTab === 'games') renderGames();
      }
      if (event.key === 'ArrowLeft') {
        selected = (selected - 1 + games.length) % games.length;
        if (currentTab === 'games') renderGames();
      }
      if (event.key === 'Enter' && currentTab === 'games') mainAction();
      if (event.key.toLowerCase() === 'f') takeShot();
      if (event.key === 'Escape') closePanel();
    });
    setInterval(() => {
      const loginClock = $('#loginClock');
      const liveClock = $('#live');
      if (loginClock) loginClock.textContent = now();
      if (liveClock) liveClock.textContent = now();
    }, 1000);
    $('#loginClock').textContent = now();
    renderUsers();
    renderApp();
  }

  init();
})();
