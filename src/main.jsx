import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const SPOTIFY_CLIENT_ID = 'd06ce2e44ce944c18f421e373e2b086a'
const REDIRECT_URI = `${window.location.origin}${window.location.pathname}`
const TOKEN_KEY = 'aurora.spotify.token.v3'
const VERIFIER_KEY = 'aurora.spotify.verifier.v3'

const initialGames = [
  { id: 'spider1', title: 'Spider-Man', tag: 'Action', accentA: '#07111f', accentB: '#1f2937' },
  { id: 'reddead', title: 'Red Dead Redemption III', tag: 'Adventure', accentA: '#dc2626', accentB: '#f59e0b' },
  { id: 'ferris', title: 'Ferris Game', tag: 'Installed', url: 'https://ferristhiel.github.io/Game/', repo: 'https://github.com/ferristhiel/Game.git', accentA: '#2f3035', accentB: '#111827' },
  { id: 'last1', title: 'The Last of Us', tag: 'Story', accentA: '#b77948', accentB: '#262626' },
  { id: 'last2', title: 'The Last of Us Part II', tag: 'Story', accentA: '#111827', accentB: '#374151' },
  { id: 'fc27', title: 'FC 27', tag: 'Sports', accentA: '#f97316', accentB: '#7c2d12' },
  { id: 'spider3', title: 'Spider-Man 3', tag: 'Action', accentA: '#dc2626', accentB: '#7f1d1d' },
  { id: 'gta', title: 'Grand Theft Auto', tag: 'Open World', accentA: '#7c3aed', accentB: '#fb7185' },
  { id: 'cyber', title: 'Cyberpunk 2', tag: 'RPG', accentA: '#facc15', accentB: '#fde047' },
]

const navItems = ['Media', 'Library', 'All', 'Settings', 'Store']

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function Button({ children, className = '', ...props }) {
  return <button className={`button ${className}`} {...props}>{children}</button>
}

async function createCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function createVerifier() {
  const bytes = new Uint8Array(64)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('')
}

async function spotifyFetch(token, endpoint, options = {}) {
  if (!token?.access_token) return null
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    ...options,
    headers: { Authorization: `Bearer ${token.access_token}`, ...(options.headers || {}) },
  })
  if (response.status === 204) return null
  if (!response.ok) throw new Error('Spotify request failed')
  return response.json()
}

function LoginScreen({ onLogin }) {
  const time = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  const cards = (
    <>
      <button className="user-card create"><div className="user-icon">+</div><strong>Create User</strong><span>Add a new user to this console</span></button>
      <button className="user-card selected" onClick={onLogin}><div className="user-icon avatar">FT</div><strong>Chri-TV</strong><span>Last online 2 hours ago</span><em>Tap to sign in</em></button>
      <button className="user-card"><div className="user-icon avatar blue">TV</div><strong>moreCHRI-TV</strong><span>Last online yesterday</span></button>
      <button className="user-card guest"><div className="user-icon">::</div><strong>Play as Guest</strong><span>All data will be deleted after you log out</span></button>
    </>
  )
  return (
    <main className="login-screen">
      <div className="p6-logo">P6</div>
      <div className="login-clock">{time}</div>
      <section className="login-copy">
        <h1>DUALSENSE 2.0 wireless controller connected</h1>
        <p>Who is using this controller?</p>
      </section>
      <section className="user-row">{cards}</section>
      <section className="user-row mirror-row">{cards}</section>
      <div className="login-fade" />
    </main>
  )
}

function MusicWidget({ spotify, onConnect, onCommand }) {
  const track = spotify.track
  const title = track?.item?.name || 'Spotify Music'
  const artist = track?.item?.artists?.map(artistItem => artistItem.name).join(', ') || (spotify.connected ? 'No active playback' : 'Connect Spotify')
  const progress = track?.progress_ms && track?.item?.duration_ms ? Math.min(100, Math.round((track.progress_ms / track.item.duration_ms) * 100)) : 0
  const playing = track?.is_playing

  return (
    <section className={`music-widget ${spotify.connected ? 'connected' : ''}`}>
      <button className="record" onClick={spotify.connected ? () => onCommand(playing ? 'pause' : 'play') : onConnect} aria-label="Spotify music control"><span /></button>
      <div className="music-body">
        <div className="music-meta"><strong>{title}</strong><span>{artist}</span></div>
        <div className="music-progress"><i style={{ width: `${progress}%` }} /></div>
        <div className="music-controls">
          <button onClick={() => onCommand('shuffle')}>Shuffle</button>
          <button onClick={() => onCommand('previous')}>Back</button>
          <button className="primary-control" onClick={spotify.connected ? () => onCommand(playing ? 'pause' : 'play') : onConnect}>{spotify.connected ? (playing ? 'Pause' : 'Play') : 'Connect'}</button>
          <button onClick={() => onCommand('next')}>Next</button>
          <button onClick={() => onCommand('repeat')}>Repeat</button>
        </div>
      </div>
    </section>
  )
}

function TopBar({ view, setView, spotify, onSpotifyConnect, onSpotifyCommand }) {
  return (
    <header className="topbar-console">
      <div className="status-left"><span>12:07</span><span>WiFi</span><span>Pad</span><span>Bell 16</span><span>Info</span><span>Trophy</span></div>
      <nav className="main-nav">
        {navItems.map(item => <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>{item}</button>)}
      </nav>
      <div className="status-right"><MusicWidget spotify={spotify} onConnect={onSpotifyConnect} onCommand={onSpotifyCommand} /><span className="profile"><span>FT</span>Chri-TV</span></div>
    </header>
  )
}

function orderedGames(selectedIndex) {
  const radius = Math.floor(initialGames.length / 2)
  const result = []
  for (let offset = -radius; offset <= radius; offset += 1) {
    const index = (selectedIndex + offset + initialGames.length) % initialGames.length
    result.push({ game: initialGames[index], index, offset })
  }
  return result
}

function GameTile({ game, index, offset, onSelect }) {
  const klass = offset === 0 ? 'selected' : Math.abs(offset) === 1 ? 'near' : Math.abs(offset) === 2 ? 'secondary' : 'compact'
  return (
    <button className={`game-card ${klass}`} onClick={() => onSelect(index)} style={{ '--a': game.accentA, '--b': game.accentB }}>
      <div className="game-cover"><span>{game.title.slice(0, 2).toUpperCase()}</span></div>
      <div className="game-label">{offset === 0 ? 'Enter' : game.title}</div>
    </button>
  )
}

function HomeScreen({ view, setView, installed, setInstalled, spotify, onSpotifyConnect, onSpotifyCommand }) {
  const [selectedIndex, setSelectedIndex] = useState(2)
  const [player, setPlayer] = useState(null)
  const selected = initialGames[selectedIndex]
  const ordered = useMemo(() => orderedGames(selectedIndex), [selectedIndex])

  useEffect(() => {
    const handle = (event) => {
      if (view !== 'All') return
      if (event.key === 'ArrowRight') setSelectedIndex(value => (value + 1) % initialGames.length)
      if (event.key === 'ArrowLeft') setSelectedIndex(value => (value - 1 + initialGames.length) % initialGames.length)
      if (event.key === 'Enter') openSelected()
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [view, selectedIndex, installed])

  function openSelected() {
    if (installed[selected.id] && selected.url) setPlayer(selected)
    else setInstalled(next => ({ ...next, [selected.id]: true }))
  }

  return (
    <main className="home-screen">
      <div className="soft-bg" />
      <TopBar view={view} setView={setView} spotify={spotify} onSpotifyConnect={onSpotifyConnect} onSpotifyCommand={onSpotifyCommand} />
      <section className="welcome-block"><h1>Welcome</h1><p>△○×□</p></section>
      <section className="game-shelf moving-shelf">
        {ordered.map(({ game, index, offset }) => <GameTile key={`${game.id}-${offset}`} game={game} index={index} offset={offset} onSelect={(next) => next === selectedIndex ? openSelected() : setSelectedIndex(next)} />)}
      </section>
      <section className="reflection-shelf moving-shelf">
        {ordered.map(({ game, index, offset }) => <GameTile key={`${game.id}-${offset}-mirror`} game={game} index={index} offset={offset} onSelect={() => {}} />)}
      </section>
      <div className="floor-fade" />
      <section className="selection-panel">
        <h2>{selected.title}</h2>
        <p>{selected.tag} · {installed[selected.id] ? 'Ready to play' : 'Available in Store'}</p>
        <Button onClick={openSelected}>{installed[selected.id] ? 'Start' : 'Install'}</Button>
        <Button className="secondary">Details</Button>
      </section>
      {player && <section className="player"><header><h2>{player.title}</h2><div><a className="button secondary" href={player.url} target="_blank" rel="noreferrer">Open Tab</a><Button onClick={() => setPlayer(null)}>Close</Button></div></header><iframe src={player.url} title={player.title} /></section>}
    </main>
  )
}

function StoreScreen({ view, setView, installed, setInstalled, spotify, onSpotifyConnect, onSpotifyCommand }) {
  const [wishlist, setWishlist] = useState(() => readJson('aurora.wishlist.react', {}))
  const [cart, setCart] = useState(() => readJson('aurora.cart.react', {}))
  const [checkout, setCheckout] = useState(null)

  useEffect(() => writeJson('aurora.wishlist.react', wishlist), [wishlist])
  useEffect(() => writeJson('aurora.cart.react', cart), [cart])

  function install(game) {
    setInstalled(next => ({ ...next, [game.id]: true }))
    setCheckout(null)
    setView('All')
  }

  return (
    <main className="home-screen store-mode">
      <div className="soft-bg" />
      <TopBar view={view} setView={setView} spotify={spotify} onSpotifyConnect={onSpotifyConnect} onSpotifyCommand={onSpotifyCommand} />
      <section className="store-wrap">
        <div className="store-hero"><div><span>Featured Store</span><h1>Aurora Store</h1><p>Install games, manage wishlist and cart, and keep the console interface clean.</p></div><div className="store-actions-top"><Button>Wishlist {Object.values(wishlist).filter(Boolean).length}</Button><Button className="secondary">Cart {Object.values(cart).filter(Boolean).length}</Button></div></div>
        <div className="store-grid">
          {initialGames.map(game => <article className="store-card" key={game.id} style={{ '--a': game.accentA, '--b': game.accentB }}><div className="store-cover"><span>{game.title.slice(0, 2).toUpperCase()}</span></div><h2>{game.title}</h2><p>{game.tag}</p><div className="store-actions"><Button onClick={() => setCheckout(game)}>{installed[game.id] ? 'Reinstall' : 'Install'}</Button><Button className="secondary" onClick={() => setWishlist(next => ({ ...next, [game.id]: true }))}>Wishlist</Button><Button className="secondary" onClick={() => setCart(next => ({ ...next, [game.id]: true }))}>Cart</Button></div></article>)}
        </div>
      </section>
      {checkout && <div className="modal-backdrop" onClick={() => setCheckout(null)}><section className="checkout-modal" onClick={event => event.stopPropagation()}><span>Checkout</span><h2>{checkout.title}</h2><p>{checkout.tag} · Free</p><div><Button onClick={() => install(checkout)}>Confirm Install</Button><Button className="secondary" onClick={() => setCheckout(null)}>Cancel</Button></div></section></div>}
    </main>
  )
}

function SpotifyScreen({ view, setView, spotify, onSpotifyConnect, onSpotifyCommand }) {
  return <main className="home-screen"><div className="soft-bg" /><TopBar view={view} setView={setView} spotify={spotify} onSpotifyConnect={onSpotifyConnect} onSpotifyCommand={onSpotifyCommand} /><section className="store-wrap"><div className="store-hero"><div><span>Spotify</span><h1>Console Music</h1><p>Spotify is connected through your Client ID and PKCE. Use the music widget in the top bar to control playback.</p></div><Button onClick={onSpotifyConnect}>{spotify.connected ? 'Reconnect Spotify' : 'Connect Spotify'}</Button></div></section></main>
}

function SettingsScreen({ view, setView, spotify, onSpotifyConnect, onSpotifyCommand }) {
  return <main className="home-screen"><div className="soft-bg" /><TopBar view={view} setView={setView} spotify={spotify} onSpotifyConnect={onSpotifyConnect} onSpotifyCommand={onSpotifyCommand} /><section className="store-wrap"><div className="store-hero"><div><span>System</span><h1>Settings</h1><p>Controls, storage, account, controller support and system settings.</p></div></div></section></main>
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [view, setView] = useState('All')
  const [installed, setInstalled] = useState({ ferris: true })
  const [spotifyToken, setSpotifyToken] = useState(() => readJson(TOKEN_KEY, null))
  const [spotifyTrack, setSpotifyTrack] = useState(null)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState('off')

  const spotify = { connected: Boolean(spotifyToken?.access_token), token: spotifyToken, track: spotifyTrack, shuffle, repeat }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code || spotifyToken?.access_token) return
    const verifier = localStorage.getItem(VERIFIER_KEY)
    if (!verifier) return
    const body = new URLSearchParams({ client_id: SPOTIFY_CLIENT_ID, grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI, code_verifier: verifier })
    fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
      .then(response => response.json())
      .then(token => {
        const withExpiry = { ...token, expiresAt: Date.now() + (token.expires_in || 3600) * 1000 }
        setSpotifyToken(withExpiry)
        writeJson(TOKEN_KEY, withExpiry)
        window.history.replaceState({}, document.title, REDIRECT_URI)
      })
      .catch(() => {})
  }, [spotifyToken])

  useEffect(() => {
    if (!spotifyToken?.access_token) return
    const load = () => spotifyFetch(spotifyToken, '/me/player/currently-playing').then(setSpotifyTrack).catch(() => {})
    load()
    const interval = window.setInterval(load, 12000)
    return () => window.clearInterval(interval)
  }, [spotifyToken])

  async function connectSpotify() {
    const verifier = createVerifier()
    localStorage.setItem(VERIFIER_KEY, verifier)
    const challenge = await createCodeChallenge(verifier)
    const scope = ['user-read-private', 'playlist-read-private', 'user-read-playback-state', 'user-modify-playback-state'].join(' ')
    const params = new URLSearchParams({ response_type: 'code', client_id: SPOTIFY_CLIENT_ID, redirect_uri: REDIRECT_URI, scope, code_challenge_method: 'S256', code_challenge: challenge })
    window.location.href = `https://accounts.spotify.com/authorize?${params}`
  }

  async function spotifyCommand(command) {
    if (!spotifyToken?.access_token) return connectSpotify()
    try {
      if (command === 'play') await spotifyFetch(spotifyToken, '/me/player/play', { method: 'PUT' })
      if (command === 'pause') await spotifyFetch(spotifyToken, '/me/player/pause', { method: 'PUT' })
      if (command === 'next') await spotifyFetch(spotifyToken, '/me/player/next', { method: 'POST' })
      if (command === 'previous') await spotifyFetch(spotifyToken, '/me/player/previous', { method: 'POST' })
      if (command === 'shuffle') { const next = !shuffle; setShuffle(next); await spotifyFetch(spotifyToken, `/me/player/shuffle?state=${next}`, { method: 'PUT' }) }
      if (command === 'repeat') { const next = repeat === 'off' ? 'context' : 'off'; setRepeat(next); await spotifyFetch(spotifyToken, `/me/player/repeat?state=${next}`, { method: 'PUT' }) }
      const current = await spotifyFetch(spotifyToken, '/me/player/currently-playing')
      setSpotifyTrack(current)
    } catch {
      connectSpotify()
    }
  }

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />
  if (view === 'Store') return <StoreScreen view={view} setView={setView} installed={installed} setInstalled={setInstalled} spotify={spotify} onSpotifyConnect={connectSpotify} onSpotifyCommand={spotifyCommand} />
  if (view === 'Settings') return <SettingsScreen view={view} setView={setView} spotify={spotify} onSpotifyConnect={connectSpotify} onSpotifyCommand={spotifyCommand} />
  if (view === 'Media') return <SpotifyScreen view={view} setView={setView} spotify={spotify} onSpotifyConnect={connectSpotify} onSpotifyCommand={spotifyCommand} />
  return <HomeScreen view={view} setView={setView} installed={installed} setInstalled={setInstalled} spotify={spotify} onSpotifyConnect={connectSpotify} onSpotifyCommand={spotifyCommand} />
}

createRoot(document.getElementById('root')).render(<App />)
