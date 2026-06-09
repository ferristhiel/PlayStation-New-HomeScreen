import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const SPOTIFY_CLIENT_ID = 'd06ce2e44ce944c18f421e373e2b086a'
const STORAGE = {
  installed: 'aurora.installed.v2',
  installs: 'aurora.installs.v2',
  customGames: 'aurora.customGames.v2',
  wishlist: 'aurora.wishlist.v2',
  cart: 'aurora.cart.v2',
  user: 'aurora.user.v2',
  spotifyVerifier: 'aurora.spotify.verifier.v1',
  spotifyToken: 'aurora.spotify.token.v1',
}

const baseGames = [
  { id: 'ferris', title: 'Ferris Game', tag: 'Adventure', description: 'GitHub Pages experience with a compact launch flow.', repo: 'https://github.com/ferristhiel/Game.git', url: 'https://ferristhiel.github.io/Game/', price: 0, accentA: '#121826', accentB: '#64748b' },
  { id: 'retro', title: 'Retro Pixel Game', tag: 'Arcade', description: 'Pixel-based action game imported from GitHub Pages.', repo: 'https://github.com/ferristhiel/Retro-Pixel-Game.git', url: 'https://ferristhiel.github.io/Retro-Pixel-Game/', price: 0, accentA: '#f59e0b', accentB: '#7c3aed' },
  { id: 'three', title: '3D Game', tag: 'Adventure', description: 'Browser-based 3D world prepared for console launching.', repo: 'https://github.com/ferristhiel/3D-Game.git', url: 'https://ferristhiel.github.io/3D-Game/', price: 0, accentA: '#0ea5e9', accentB: '#14b8a6' },
  { id: 'echo', title: 'Echo Runner', tag: 'Racing', description: 'High-speed concept title for the Aurora store demo.', price: 19.99, accentA: '#ef4444', accentB: '#7f1d1d' },
  { id: 'void', title: 'Void Garden', tag: 'Strategy', description: 'Atmospheric store concept for testing checkout states.', price: 0, accentA: '#6d28d9', accentB: '#0891b2' },
  { id: 'forge', title: 'Lumen Forge', tag: 'Creative', description: 'Creative building universe with premium presentation.', price: 29.99, accentA: '#f97316', accentB: '#db2777' },
]

const systemItems = [
  { id: 'store', type: 'system', title: 'Store', tag: 'System', description: 'Browse, purchase, install and manage games.', accentA: '#e2e8f0', accentB: '#ffffff' },
  { id: 'spotify', type: 'system', title: 'Spotify', tag: 'Media', description: 'Connect Spotify and control music inside Aurora.', accentA: '#0f172a', accentB: '#1db954' },
  { id: 'settings', type: 'system', title: 'Settings', tag: 'System', description: 'Configure Aurora controls, account and storage.', accentA: '#111827', accentB: '#64748b' },
]

function readStore(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function writeStore(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function cn(...items) {
  return items.filter(Boolean).join(' ')
}

function formatPrice(price) {
  return price ? `${price.toFixed(2)} EUR` : 'Free'
}

function createRepoGame(input) {
  const match = String(input || '').trim().match(/github\.com\/([^/\s]+)\/([^/\s#?]+?)(?:\.git)?(?:[/?#].*)?$/i)
  if (!match) return null
  const owner = match[1]
  const repo = match[2].replace(/\.git$/i, '')
  const id = `gh-${owner}-${repo}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  const pages = repo.toLowerCase() === `${owner.toLowerCase()}.github.io` ? `https://${owner}.github.io/` : `https://${owner}.github.io/${repo}/`
  return {
    id,
    title: repo.replace(/[-_]/g, ' '),
    tag: 'GitHub',
    description: `Imported public repository by ${owner}.`,
    repo: `https://github.com/${owner}/${repo}.git`,
    url: pages,
    price: 0,
    accentA: '#111827',
    accentB: '#64748b',
  }
}

function Button({ children, variant = 'primary', className = '', ...props }) {
  return <button className={cn('btn', `btn-${variant}`, className)} {...props}>{children}</button>
}

function Badge({ children }) {
  return <span className="badge">{children}</span>
}

function Card({ children, className = '', style }) {
  return <section className={cn('card', className)} style={style}>{children}</section>
}

function TopBar({ view, setView, user, wishlistCount, cartCount, onWishlist, onCart }) {
  return (
    <header className="topbar">
      <button className="brand-button" onClick={() => setView('home')}>
        <span className="brand-mark" />
        <span>Aurora Console</span>
      </button>
      <nav className="topnav" aria-label="Main navigation">
        <button className={cn(view === 'home' && 'active')} onClick={() => setView('home')}>Home</button>
        <button className={cn(view === 'store' && 'active')} onClick={() => setView('store')}>Store</button>
        <button className={cn(view === 'spotify' && 'active')} onClick={() => setView('spotify')}>Spotify</button>
        <button className={cn(view === 'settings' && 'active')} onClick={() => setView('settings')}>Settings</button>
      </nav>
      <div className="top-actions">
        {view === 'store' && (
          <>
            <Button variant="ghost" onClick={onWishlist}>Wishlist {wishlistCount}</Button>
            <Button variant="ghost" onClick={onCart}>Cart {cartCount}</Button>
          </>
        )}
        <span className="clock">{new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
        <span className="profile-pill">{user.initials}</span>
      </div>
    </header>
  )
}

function BootScreen({ onEnter }) {
  return (
    <div className="boot-screen">
      <div className="boot-orbit" />
      <div className="boot-card">
        <span className="brand-mark large" />
        <h1>Aurora</h1>
        <p>Professional console interface initialized.</p>
        <Button onClick={onEnter}>Start System</Button>
      </div>
    </div>
  )
}

function GameTile({ item, offset, index, selected, installed, activeDownload, onSelect }) {
  const state = selected ? 'selected' : Math.abs(offset) === 1 ? 'near' : Math.abs(offset) === 2 ? 'secondary' : 'compact'
  return (
    <button
      className={cn('game-tile', state, item.type === 'system' && 'system-tile', !installed && item.type !== 'system' && 'locked')}
      onClick={() => onSelect(index)}
      style={{ '--accent-a': item.accentA, '--accent-b': item.accentB }}
      aria-label={item.title}
    >
      <div className="tile-cover">
        <span className="tile-code">{item.title.slice(0, 2).toUpperCase()}</span>
      </div>
      <div className="tile-copy">
        <strong>{item.title}</strong>
        <span>{activeDownload ? `${activeDownload.progress}%` : installed || item.type === 'system' ? 'Ready' : 'Store'}</span>
      </div>
    </button>
  )
}

function HomeScreen({ items, selectedIndex, setSelectedIndex, installed, downloads, launchGame, setView, openCheckout }) {
  const selected = items[selectedIndex] || items[0]
  const selectedInstalled = selected?.type === 'system' || installed[selected?.id]
  const activeDownload = downloads[selected?.id]

  function move(direction) {
    const next = (selectedIndex + direction + items.length) % items.length
    setSelectedIndex(next)
  }

  function openSelected() {
    if (!selected) return
    if (selected.id === 'store') return setView('store')
    if (selected.id === 'spotify') return setView('spotify')
    if (selected.id === 'settings') return setView('settings')
    if (selectedInstalled) return launchGame(selected)
    openCheckout(selected)
  }

  return (
    <main className="home-screen">
      <section className="home-hero">
        <Badge>Aurora Home</Badge>
        <h1>Choose your next session.</h1>
        <div className="status-loader"><i />{activeDownload ? `${activeDownload.phase} ${activeDownload.progress}%` : selectedInstalled ? 'Ready' : 'Available in Store'}</div>
      </section>

      <section className="carousel-shell">
        <button className="carousel-nav left" onClick={() => move(-1)}>Previous</button>
        <div className="carousel-track">
          {items.map((item, index) => {
            let offset = index - selectedIndex
            if (offset > items.length / 2) offset -= items.length
            if (offset < -items.length / 2) offset += items.length
            return (
              <GameTile
                key={item.id}
                item={item}
                index={index}
                offset={offset}
                selected={index === selectedIndex}
                installed={item.type === 'system' || installed[item.id]}
                activeDownload={downloads[item.id]}
                onSelect={(tileIndex) => tileIndex === selectedIndex ? openSelected() : setSelectedIndex(tileIndex)}
              />
            )
          })}
        </div>
        <button className="carousel-nav right" onClick={() => move(1)}>Next</button>
      </section>

      <Card className="selected-panel">
        <div>
          <Badge>{selected?.tag}</Badge>
          <h2>{selected?.title}</h2>
          <p>{selected?.description}</p>
        </div>
        <div className="panel-actions">
          <Button onClick={openSelected}>{selectedInstalled ? 'Open' : 'View in Store'}</Button>
          {selected?.type !== 'system' && <Button variant="secondary" onClick={() => openCheckout(selected)}>Details</Button>}
        </div>
      </Card>
    </main>
  )
}

function StoreScreen({ games, installed, wishlist, cart, downloads, setWishlist, setCart, openCheckout, uninstallGame, addCustomGame }) {
  const [filter, setFilter] = useState('Featured')
  const [repoUrl, setRepoUrl] = useState('')
  const filters = ['Featured', 'Installed', 'GitHub', 'Adventure', 'Arcade', 'Racing', 'Strategy', 'Creative']
  const featured = games[0]
  const list = games.filter((game) => filter === 'Featured' || (filter === 'Installed' ? installed[game.id] : game.tag === filter))

  function toggleWishlist(id) {
    setWishlist((next) => ({ ...next, [id]: !next[id] }))
  }

  function addToCart(id) {
    setCart((next) => ({ ...next, [id]: true }))
  }

  function submitRepo(event) {
    event.preventDefault()
    const game = createRepoGame(repoUrl)
    if (!game) return
    addCustomGame(game)
    setRepoUrl('')
    setFilter('GitHub')
  }

  return (
    <main className="store-screen">
      <Card className="store-hero" style={{ '--accent-a': featured?.accentA, '--accent-b': featured?.accentB }}>
        <div className="store-hero-copy">
          <Badge>Featured Store</Badge>
          <h1>{featured?.title}</h1>
          <p>Discover games, confirm purchases, install public GitHub repositories and manage your Aurora library.</p>
          <div className="store-stats">
            <span>{games.length} Titles</span>
            <span>{Object.values(wishlist).filter(Boolean).length} Saved</span>
            <span>{Object.values(cart).filter(Boolean).length} In Cart</span>
          </div>
          <Button onClick={() => openCheckout(featured)}>Open Featured</Button>
        </div>
        <form className="repo-panel" onSubmit={submitRepo}>
          <strong>Add GitHub Repository</strong>
          <p>Public repositories can be cloned into browser storage and launched through GitHub Pages when available.</p>
          <input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="https://github.com/user/repository" />
          <Button type="submit">Add Repository</Button>
        </form>
      </Card>

      <div className="store-filters">
        {filters.map((item) => <button key={item} className={cn(filter === item && 'active')} onClick={() => setFilter(item)}>{item}</button>)}
      </div>

      <section className="store-grid">
        {list.map((game) => (
          <Card key={game.id} className="store-card" style={{ '--accent-a': game.accentA, '--accent-b': game.accentB }}>
            <div className="store-cover"><span>{game.title.slice(0, 2).toUpperCase()}</span></div>
            <div className="store-card-head">
              <Badge>{game.tag}</Badge>
              <Button variant={wishlist[game.id] ? 'primary' : 'ghost'} onClick={() => toggleWishlist(game.id)}>Save</Button>
            </div>
            <h2>{game.title}</h2>
            <p>{game.description}</p>
            <span className="price-line">{formatPrice(game.price)}</span>
            {downloads[game.id] && <div className="progress"><i style={{ width: `${downloads[game.id].progress}%` }} /></div>}
            <div className="store-actions">
              <Button onClick={() => openCheckout(game)}>{installed[game.id] ? 'Reinstall' : 'Purchase'}</Button>
              <Button variant="secondary" onClick={() => addToCart(game.id)}>{cart[game.id] ? 'In Cart' : 'Add to Cart'}</Button>
              {installed[game.id] && <Button variant="ghost" onClick={() => uninstallGame(game)}>Uninstall</Button>}
            </div>
          </Card>
        ))}
      </section>
    </main>
  )
}

function Sheet({ title, children, onClose }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <aside className="sheet" onMouseDown={(event) => event.stopPropagation()}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        {children}
      </aside>
    </div>
  )
}

function CheckoutDialog({ game, onClose, onConfirm, onCart }) {
  if (!game) return null
  return (
    <div className="overlay" onMouseDown={onClose}>
      <Card className="dialog" onMouseDown={(event) => event.stopPropagation()}>
        <Badge>{game.tag}</Badge>
        <h2>Confirm purchase</h2>
        <p>{game.title}</p>
        <span className="price-line">{formatPrice(game.price)}</span>
        <p className="muted">Installation will use the browser storage clone flow when a public GitHub repository is available.</p>
        <div className="dialog-actions">
          <Button onClick={() => onConfirm(game)}>Confirm and Install</Button>
          <Button variant="secondary" onClick={() => onCart(game.id)}>Add to Cart</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </Card>
    </div>
  )
}

function ListSheet({ title, ids, games, onClose, onRemove, onCheckout, checkoutAll }) {
  return (
    <Sheet title={title} onClose={onClose}>
      <div className="list-stack">
        {ids.length === 0 && <Card><h3>No items</h3><p>This list is empty.</p></Card>}
        {ids.map((id) => {
          const game = games.find((item) => item.id === id)
          if (!game) return null
          return (
            <Card key={id} className="list-row">
              <div>
                <strong>{game.title}</strong>
                <p>{game.tag} · {formatPrice(game.price)}</p>
              </div>
              <div className="row-actions">
                <Button onClick={() => onCheckout(game)}>Checkout</Button>
                <Button variant="ghost" onClick={() => onRemove(id)}>Remove</Button>
              </div>
            </Card>
          )
        })}
      </div>
      {ids.length > 0 && <Button className="full-width" onClick={checkoutAll}>Checkout All</Button>}
    </Sheet>
  )
}

function SettingsScreen({ installedCount }) {
  return (
    <main className="standard-screen">
      <Card className="wide-card">
        <Badge>System</Badge>
        <h1>Settings</h1>
        <p>Aurora is now structured as a React interface with separated state, screens and reusable components.</p>
      </Card>
      <div className="settings-grid">
        <Card><h2>Installed Games</h2><strong>{installedCount}</strong><p>Items currently registered in the local Aurora library.</p></Card>
        <Card><h2>Controls</h2><p>Keyboard navigation is active. Gamepad support can be added cleanly through a dedicated hook.</p></Card>
        <Card><h2>Storage</h2><p>Small data uses localStorage. Repository clones use browser file storage through LightningFS.</p></Card>
      </div>
    </main>
  )
}

async function sha256(value) {
  const data = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function randomVerifier() {
  const values = new Uint8Array(64)
  crypto.getRandomValues(values)
  return Array.from(values, (value) => ('0' + value.toString(16)).slice(-2)).join('')
}

function SpotifyScreen() {
  const [token, setToken] = useState(() => readStore(STORAGE.spotifyToken, null))
  const [profile, setProfile] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [status, setStatus] = useState('Disconnected')

  const redirectUri = window.location.origin + window.location.pathname

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code || token?.access_token) return
    const verifier = readStore(STORAGE.spotifyVerifier, '')
    const body = new URLSearchParams({ client_id: SPOTIFY_CLIENT_ID, grant_type: 'authorization_code', code, redirect_uri: redirectUri, code_verifier: verifier })
    fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
      .then((response) => response.json())
      .then((nextToken) => {
        const withExpiry = { ...nextToken, expires_at: Date.now() + (nextToken.expires_in || 3600) * 1000 }
        writeStore(STORAGE.spotifyToken, withExpiry)
        setToken(withExpiry)
        window.history.replaceState({}, document.title, redirectUri)
      })
      .catch(() => setStatus('Spotify authorization failed'))
  }, [redirectUri, token])

  useEffect(() => {
    if (!token?.access_token) return
    setStatus('Connected')
    const headers = { Authorization: `Bearer ${token.access_token}` }
    fetch('https://api.spotify.com/v1/me', { headers }).then((response) => response.json()).then(setProfile).catch(() => setStatus('Profile unavailable'))
    fetch('https://api.spotify.com/v1/me/playlists?limit=12', { headers }).then((response) => response.json()).then((data) => setPlaylists(data.items || [])).catch(() => setStatus('Playlists unavailable'))
  }, [token])

  async function login() {
    const verifier = randomVerifier()
    writeStore(STORAGE.spotifyVerifier, verifier)
    const challenge = await sha256(verifier)
    const scope = ['user-read-private', 'user-read-email', 'playlist-read-private', 'user-read-playback-state', 'user-modify-playback-state'].join(' ')
    const params = new URLSearchParams({ response_type: 'code', client_id: SPOTIFY_CLIENT_ID, scope, redirect_uri: redirectUri, code_challenge_method: 'S256', code_challenge: challenge })
    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
  }

  function logout() {
    window.localStorage.removeItem(STORAGE.spotifyToken)
    setToken(null)
    setProfile(null)
    setPlaylists([])
    setStatus('Disconnected')
  }

  return (
    <main className="standard-screen spotify-screen">
      <Card className="wide-card spotify-hero">
        <Badge>Spotify</Badge>
        <h1>Music for the console session.</h1>
        <p>{status}</p>
        <div className="panel-actions">
          {!token?.access_token ? <Button onClick={login}>Connect Spotify</Button> : <Button variant="secondary" onClick={logout}>Disconnect</Button>}
        </div>
      </Card>
      {profile && <Card><h2>{profile.display_name || 'Spotify Account'}</h2><p>{profile.email || 'Connected account'}</p></Card>}
      <section className="playlist-grid">
        {playlists.map((playlist) => (
          <Card key={playlist.id} className="playlist-card">
            {playlist.images?.[0]?.url && <img src={playlist.images[0].url} alt="" />}
            <h3>{playlist.name}</h3>
            <p>{playlist.tracks?.total || 0} tracks</p>
            <a href={playlist.external_urls?.spotify} target="_blank" rel="noreferrer">Open in Spotify</a>
          </Card>
        ))}
      </section>
    </main>
  )
}

function GamePlayer({ game, onClose }) {
  if (!game) return null
  return (
    <section className="game-player">
      <header>
        <h2>{game.title}</h2>
        <div>
          <a className="btn btn-secondary" href={game.url} target="_blank" rel="noreferrer">Open Tab</a>
          <Button onClick={onClose}>Close</Button>
        </div>
      </header>
      <iframe src={game.url} title={game.title} />
    </section>
  )
}

function App() {
  const [booted, setBooted] = useState(false)
  const [view, setView] = useState('home')
  const [selectedIndex, setSelectedIndex] = useState(3)
  const [user] = useState(() => readStore(STORAGE.user, { initials: 'FT', name: 'Ferris' }))
  const [customGames, setCustomGames] = useState(() => readStore(STORAGE.customGames, []))
  const [installed, setInstalled] = useState(() => readStore(STORAGE.installed, { ferris: true }))
  const [installMeta, setInstallMeta] = useState(() => readStore(STORAGE.installs, {}))
  const [wishlist, setWishlist] = useState(() => readStore(STORAGE.wishlist, {}))
  const [cart, setCart] = useState(() => readStore(STORAGE.cart, {}))
  const [downloads, setDownloads] = useState({})
  const [checkoutGame, setCheckoutGame] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [activeGame, setActiveGame] = useState(null)

  const games = useMemo(() => [...baseGames, ...customGames], [customGames])
  const libraryItems = useMemo(() => [...systemItems, ...games], [games])

  useEffect(() => writeStore(STORAGE.customGames, customGames), [customGames])
  useEffect(() => writeStore(STORAGE.installed, installed), [installed])
  useEffect(() => writeStore(STORAGE.installs, installMeta), [installMeta])
  useEffect(() => writeStore(STORAGE.wishlist, wishlist), [wishlist])
  useEffect(() => writeStore(STORAGE.cart, cart), [cart])

  useEffect(() => {
    function onKey(event) {
      if (view !== 'home') return
      if (event.key === 'ArrowRight') setSelectedIndex((value) => (value + 1) % libraryItems.length)
      if (event.key === 'ArrowLeft') setSelectedIndex((value) => (value - 1 + libraryItems.length) % libraryItems.length)
      if (event.key === 'Enter') document.querySelector('.game-tile.selected')?.click()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [libraryItems.length, view])

  async function installGame(game) {
    setCheckoutGame(null)
    setDownloads((next) => ({ ...next, [game.id]: { progress: 2, phase: 'Preparing' } }))
    if (game.repo) {
      try {
        const [{ default: git }, httpModule, fsModule] = await Promise.all([
          import('isomorphic-git'),
          import('isomorphic-git/http/web'),
          import('@isomorphic-git/lightning-fs'),
        ])
        const LightningFS = fsModule.default
        const fs = new LightningFS('aurora-console-fs')
        const dir = `/games/${game.id}`
        await fs.promises.mkdir('/games').catch(() => {})
        await fs.promises.rmdir(dir, { recursive: true }).catch(() => {})
        await git.clone({ fs, http: httpModule.default, dir, url: game.repo, corsProxy: 'https://cors.isomorphic-git.org', singleBranch: true, depth: 1, noTags: true, onProgress: (progress) => {
          const total = progress.total || progress.loaded || 100
          const percent = Math.max(4, Math.min(99, Math.round(((progress.loaded || 0) / total) * 100)))
          setDownloads((next) => ({ ...next, [game.id]: { progress: percent, phase: progress.phase || 'Cloning' } }))
        } })
      } catch (error) {
        setDownloads((next) => ({ ...next, [game.id]: { progress: 100, phase: 'Pages fallback' } }))
      }
    }
    setInstalled((next) => ({ ...next, [game.id]: true }))
    setInstallMeta((next) => ({ ...next, [game.id]: { title: game.title, repo: game.repo || '', installedAt: new Date().toISOString() } }))
    setDownloads((next) => {
      const copy = { ...next }
      delete copy[game.id]
      return copy
    })
    setView('home')
  }

  function uninstallGame(game) {
    setInstalled((next) => {
      const copy = { ...next }
      delete copy[game.id]
      return copy
    })
    setInstallMeta((next) => {
      const copy = { ...next }
      delete copy[game.id]
      return copy
    })
  }

  function addCustomGame(game) {
    setCustomGames((next) => [game, ...next.filter((item) => item.id !== game.id)])
  }

  function checkoutAll(ids) {
    setSheet(null)
    ids.forEach((id) => {
      const game = games.find((item) => item.id === id)
      if (game) installGame(game)
    })
    setCart({})
  }

  if (!booted) return <BootScreen onEnter={() => setBooted(true)} />

  return (
    <div className="aurora-app">
      <TopBar
        view={view}
        setView={setView}
        user={user}
        wishlistCount={Object.values(wishlist).filter(Boolean).length}
        cartCount={Object.values(cart).filter(Boolean).length}
        onWishlist={() => setSheet('wishlist')}
        onCart={() => setSheet('cart')}
      />

      {view === 'home' && <HomeScreen items={libraryItems} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} installed={installed} downloads={downloads} launchGame={setActiveGame} setView={setView} openCheckout={setCheckoutGame} />}
      {view === 'store' && <StoreScreen games={games} installed={installed} wishlist={wishlist} cart={cart} downloads={downloads} setWishlist={setWishlist} setCart={setCart} openCheckout={setCheckoutGame} uninstallGame={uninstallGame} addCustomGame={addCustomGame} />}
      {view === 'spotify' && <SpotifyScreen />}
      {view === 'settings' && <SettingsScreen installedCount={Object.keys(installMeta).length} />}

      <CheckoutDialog game={checkoutGame} onClose={() => setCheckoutGame(null)} onConfirm={installGame} onCart={(id) => setCart((next) => ({ ...next, [id]: true }))} />
      {sheet === 'wishlist' && <ListSheet title="Wishlist" ids={Object.keys(wishlist).filter((id) => wishlist[id])} games={games} onClose={() => setSheet(null)} onRemove={(id) => setWishlist((next) => ({ ...next, [id]: false }))} onCheckout={setCheckoutGame} checkoutAll={() => checkoutAll(Object.keys(wishlist).filter((id) => wishlist[id]))} />}
      {sheet === 'cart' && <ListSheet title="Cart" ids={Object.keys(cart).filter((id) => cart[id])} games={games} onClose={() => setSheet(null)} onRemove={(id) => setCart((next) => ({ ...next, [id]: false }))} onCheckout={setCheckoutGame} checkoutAll={() => checkoutAll(Object.keys(cart).filter((id) => cart[id]))} />}
      <GamePlayer game={activeGame} onClose={() => setActiveGame(null)} />
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
