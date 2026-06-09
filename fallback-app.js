(() => {
  const games = [
    { id: 'ferris', title: 'Ferris Game', tag: 'Adventure', url: 'https://ferristhiel.github.io/Game/', repo: 'https://github.com/ferristhiel/Game.git', a: '#121826', b: '#64748b' },
    { id: 'retro', title: 'Retro Pixel Game', tag: 'Arcade', url: 'https://ferristhiel.github.io/Retro-Pixel-Game/', repo: 'https://github.com/ferristhiel/Retro-Pixel-Game.git', a: '#f59e0b', b: '#7c3aed' },
    { id: 'three', title: '3D Game', tag: 'Adventure', url: 'https://ferristhiel.github.io/3D-Game/', repo: 'https://github.com/ferristhiel/3D-Game.git', a: '#0ea5e9', b: '#14b8a6' },
    { id: 'echo', title: 'Echo Runner', tag: 'Racing', a: '#ef4444', b: '#7f1d1d' },
    { id: 'void', title: 'Void Garden', tag: 'Strategy', a: '#6d28d9', b: '#0891b2' },
    { id: 'forge', title: 'Lumen Forge', tag: 'Creative', a: '#f97316', b: '#db2777' }
  ];
  const system = [
    { id: 'store', title: 'Store', tag: 'System', a: '#e2e8f0', b: '#ffffff' },
    { id: 'spotify', title: 'Spotify', tag: 'Media', a: '#0f172a', b: '#1db954' },
    { id: 'settings', title: 'Settings', tag: 'System', a: '#111827', b: '#64748b' }
  ];
  const keys = { installed: 'aurora.installed.v2', wish: 'aurora.wishlist.v2', cart: 'aurora.cart.v2', custom: 'aurora.customGames.v2', token: 'aurora.spotify.token.v1', verifier: 'aurora.spotify.verifier.v1' };
  const clientId = 'd06ce2e44ce944c18f421e373e2b086a';
  const root = document.querySelector('#root');
  const read = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) || f; } catch { return f; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const state = { boot: false, view: 'home', selected: 3, installed: read(keys.installed, { ferris: true }), wish: read(keys.wish, {}), cart: read(keys.cart, {}), custom: read(keys.custom, []), player: null };
  const allGames = () => [...games, ...state.custom];
  const items = () => [...system, ...allGames()];
  const esc = (s) => String(s || '').replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[m]));
  const count = (o) => Object.values(o).filter(Boolean).length;
  function save() { write(keys.installed, state.installed); write(keys.wish, state.wish); write(keys.cart, state.cart); write(keys.custom, state.custom); }
  function tile(item, index) {
    let offset = index - state.selected;
    const total = items().length;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    const klass = offset === 0 ? 'selected' : Math.abs(offset) === 1 ? 'near' : Math.abs(offset) === 2 ? 'secondary' : 'compact';
    const ready = system.some(s => s.id === item.id) || state.installed[item.id];
    return `<button class="game-tile ${klass} ${ready ? '' : 'locked'}" data-index="${index}" style="--accent-a:${item.a};--accent-b:${item.b}"><span class="tile-cover"><span class="tile-code">${esc(item.title).slice(0,2).toUpperCase()}</span></span><span class="tile-copy"><strong>${esc(item.title)}</strong><span>${ready ? 'Ready' : 'Store'}</span></span></button>`;
  }
  function topbar() {
    const storeButtons = state.view === 'store' ? `<button data-action="wishList">Wishlist ${count(state.wish)}</button><button data-action="cartList">Cart ${count(state.cart)}</button>` : '';
    return `<header class="topbar"><button class="brand-button" data-view="home"><span class="brand-mark"></span><span>Aurora Console</span></button><nav class="topnav"><button data-view="home" class="${state.view === 'home' ? 'active' : ''}">Home</button><button data-view="store" class="${state.view === 'store' ? 'active' : ''}">Store</button><button data-view="spotify" class="${state.view === 'spotify' ? 'active' : ''}">Spotify</button><button data-view="settings" class="${state.view === 'settings' ? 'active' : ''}">Settings</button></nav><div class="top-actions">${storeButtons}<span class="clock">${new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}</span><span class="profile-pill">FT</span></div></header>`;
  }
  function renderBoot() {
    root.innerHTML = `<div class="boot-screen"><div class="boot-orbit"></div><div class="boot-card"><span class="brand-mark large"></span><h1>Aurora</h1><p>Professional console interface initialized.</p><button class="btn" data-action="boot">Start System</button></div></div>`;
  }
  function renderHome() {
    const list = items();
    const selected = list[state.selected] || list[0];
    const ready = system.some(s => s.id === selected.id) || state.installed[selected.id];
    root.innerHTML = `${topbar()}<main class="home-screen"><section class="home-hero"><span class="badge">Aurora Home</span><h1>Choose your next session.</h1><div class="status-loader"><i></i>${ready ? 'Ready' : 'Available in Store'}</div></section><section class="carousel-shell"><button class="carousel-nav left" data-action="prev">Previous</button><div class="carousel-track">${list.map(tile).join('')}</div><button class="carousel-nav right" data-action="next">Next</button></section><section class="card selected-panel"><div><span class="badge">${esc(selected.tag)}</span><h2>${esc(selected.title)}</h2><p>${ready ? 'Ready to open.' : 'Install from the Aurora Store.'}</p></div><div class="panel-actions"><button class="btn" data-action="open">${ready ? 'Open' : 'View in Store'}</button></div></section></main>`;
  }
  function renderStore() {
    const cards = allGames().map(g => `<section class="card store-card" style="--accent-a:${g.a};--accent-b:${g.b}"><div class="store-cover"><span>${esc(g.title).slice(0,2).toUpperCase()}</span></div><div class="store-card-head"><span class="badge">${esc(g.tag)}</span><button class="btn btn-ghost" data-wish="${g.id}">${state.wish[g.id] ? 'Saved' : 'Save'}</button></div><h2>${esc(g.title)}</h2><p>${esc(g.repo || 'Aurora store title')}</p><span class="price-line">Free</span><div class="store-actions"><button class="btn" data-buy="${g.id}">${state.installed[g.id] ? 'Reinstall' : 'Purchase'}</button><button class="btn btn-secondary" data-cart="${g.id}">${state.cart[g.id] ? 'In Cart' : 'Add to Cart'}</button>${state.installed[g.id] ? `<button class="btn btn-ghost" data-uninstall="${g.id}">Uninstall</button>` : ''}</div></section>`).join('');
    root.innerHTML = `${topbar()}<main class="store-screen"><section class="card store-hero" style="--accent-a:#121826;--accent-b:#64748b"><div><span class="badge">Featured Store</span><h1>Ferris Game</h1><p>Discover games, confirm purchases and manage the local Aurora library.</p><div class="store-stats"><span>${allGames().length} Titles</span><span>${count(state.wish)} Saved</span><span>${count(state.cart)} In Cart</span></div></div><form class="repo-panel"><strong>Add GitHub Repository</strong><p>Public repositories can be added to the store.</p><input id="repoInput" placeholder="https://github.com/user/repository"><button class="btn" type="submit">Add Repository</button></form></section><section class="store-grid">${cards}</section></main>`;
  }
  function renderSpotify() {
    root.innerHTML = `${topbar()}<main class="standard-screen spotify-screen"><section class="card wide-card spotify-hero"><span class="badge">Spotify</span><h1>Music for the console session.</h1><p>Connect Spotify using Authorization Code with PKCE.</p><div class="panel-actions"><button class="btn" data-action="spotifyLogin">Connect Spotify</button></div></section></main>`;
  }
  function renderSettings() {
    root.innerHTML = `${topbar()}<main class="standard-screen"><section class="card wide-card"><span class="badge">System</span><h1>Settings</h1><p>Aurora is running in a stable browser fallback while the Vite build workflow is available for production deployment.</p></section></main>`;
  }
  function renderPlayer() {
    if (!state.player) return;
    root.insertAdjacentHTML('beforeend', `<section class="game-player"><header><h2>${esc(state.player.title)}</h2><div><a class="btn btn-secondary" href="${state.player.url}" target="_blank" rel="noreferrer">Open Tab</a><button class="btn" data-action="closePlayer">Close</button></div></header><iframe src="${state.player.url}" title="${esc(state.player.title)}"></iframe></section>`);
  }
  function render() {
    if (!state.boot) return renderBoot();
    if (state.view === 'store') renderStore(); else if (state.view === 'spotify') renderSpotify(); else if (state.view === 'settings') renderSettings(); else renderHome();
    renderPlayer();
  }
  function repoToGame(value) {
    const m = String(value || '').trim().match(/github\.com\/([^/\s]+)\/([^/\s#?]+?)(?:\.git)?(?:[/?#].*)?$/i);
    if (!m) return null;
    const owner = m[1], repo = m[2].replace(/\.git$/i, '');
    return { id: `gh-${owner}-${repo}`.toLowerCase().replace(/[^a-z0-9-]/g,'-'), title: repo.replace(/[-_]/g,' '), tag: 'GitHub', repo: `https://github.com/${owner}/${repo}.git`, url: `https://${owner}.github.io/${repo}/`, a: '#111827', b: '#64748b' };
  }
  async function spotifyLogin() {
    const verifier = Array.from(crypto.getRandomValues(new Uint8Array(48)), b => b.toString(16).padStart(2,'0')).join('');
    localStorage.setItem(keys.verifier, JSON.stringify(verifier));
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    const challenge = btoa(String.fromCharCode(...new Uint8Array(hash))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const params = new URLSearchParams({ response_type:'code', client_id:clientId, scope:'user-read-private playlist-read-private', redirect_uri: location.origin + location.pathname, code_challenge_method:'S256', code_challenge:challenge });
    location.href = `https://accounts.spotify.com/authorize?${params}`;
  }
  document.addEventListener('click', e => {
    const view = e.target.closest('[data-view]')?.dataset.view; if (view) { state.view = view; render(); return; }
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'boot') { state.boot = true; render(); }
    if (action === 'prev') { state.selected = (state.selected - 1 + items().length) % items().length; render(); }
    if (action === 'next') { state.selected = (state.selected + 1) % items().length; render(); }
    if (action === 'open') { const item = items()[state.selected]; if (item.id === 'store' || !state.installed[item.id] && !system.some(s => s.id === item.id)) state.view = 'store'; else if (item.id === 'spotify') state.view = 'spotify'; else if (item.id === 'settings') state.view = 'settings'; else if (item.url) state.player = item; render(); }
    const tile = e.target.closest('[data-index]'); if (tile) { const i = Number(tile.dataset.index); if (i === state.selected) { const item = items()[i]; if (item.url && state.installed[item.id]) state.player = item; else state.view = item.id === 'store' ? 'store' : item.id === 'spotify' ? 'spotify' : item.id === 'settings' ? 'settings' : 'store'; } else state.selected = i; render(); }
    const buy = e.target.closest('[data-buy]')?.dataset.buy; if (buy) { state.installed[buy] = true; save(); state.view = 'home'; render(); }
    const wish = e.target.closest('[data-wish]')?.dataset.wish; if (wish) { state.wish[wish] = !state.wish[wish]; save(); render(); }
    const cart = e.target.closest('[data-cart]')?.dataset.cart; if (cart) { state.cart[cart] = true; save(); render(); }
    const un = e.target.closest('[data-uninstall]')?.dataset.uninstall; if (un) { delete state.installed[un]; save(); render(); }
    if (action === 'closePlayer') { state.player = null; render(); }
    if (action === 'spotifyLogin') spotifyLogin();
  });
  document.addEventListener('submit', e => { e.preventDefault(); const game = repoToGame(document.querySelector('#repoInput')?.value); if (game) { state.custom = [game, ...state.custom.filter(g => g.id !== game.id)]; save(); render(); } });
  document.addEventListener('keydown', e => { if (!state.boot || state.view !== 'home') return; if (e.key === 'ArrowRight') { state.selected = (state.selected + 1) % items().length; render(); } if (e.key === 'ArrowLeft') { state.selected = (state.selected - 1 + items().length) % items().length; render(); } if (e.key === 'Enter') document.querySelector('.game-tile.selected')?.click(); });
  render();
})();
