import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const SPOTIFY_CLIENT_ID = 'd06ce2e44ce944c18f421e373e2b086a'

const games = [
  { id: 'spider1', title: 'Spider-Man', tag: 'Action', accentA: '#07111f', accentB: '#1f2937' },
  { id: 'reddead', title: 'Red Dead Redemption III', tag: 'Adventure', accentA: '#dc2626', accentB: '#f59e0b' },
  { id: 'ferris', title: 'Ferris Game', tag: 'Installed', url: 'https://ferristhiel.github.io/Game/', accentA: '#2f3035', accentB: '#111827' },
  { id: 'last1', title: 'The Last of Us', tag: 'Story', accentA: '#b77948', accentB: '#262626' },
  { id: 'last2', title: 'The Last of Us Part II', tag: 'Story', accentA: '#111827', accentB: '#374151' },
  { id: 'fc27', title: 'FC 27', tag: 'Sports', accentA: '#f97316', accentB: '#7c2d12' },
  { id: 'spider3', title: 'Spider-Man 3', tag: 'Action', accentA: '#dc2626', accentB: '#7f1d1d' },
  { id: 'gta', title: 'Grand Theft Auto', tag: 'Open World', accentA: '#7c3aed', accentB: '#fb7185' },
  { id: 'cyber', title: 'Cyberpunk 2', tag: 'RPG', accentA: '#facc15', accentB: '#fde047' },
]

const navItems = ['Media', 'Library', 'All', 'Settings', 'Store']

function Button({ children, className = '', ...props }) {
  return <button className={`button ${className}`} {...props}>{children}</button>
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

function TopBar({ view, setView }) {
  return (
    <header className="topbar-console">
      <div className="status-left"><span>12:07</span><span>WiFi</span><span>Pad</span><span>Bell 16</span><span>Info</span><span>Trophy</span></div>
      <nav className="main-nav">
        {navItems.map(item => <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>{item}</button>)}
      </nav>
      <div className="status-right"><span>Friends</span><span>PS</span><span>Plus</span><span className="profile"><span>FT</span>Chri-TV</span></div>
    </header>
  )
}

function GameTile({ game, index, selectedIndex, onSelect }) {
  const offset = index - selectedIndex
  const klass = offset === 0 ? 'selected' : Math.abs(offset) === 1 ? 'near' : Math.abs(offset) === 2 ? 'secondary' : 'compact'
  return (
    <button className={`game-card ${klass}`} onClick={() => onSelect(index)} style={{ '--a': game.accentA, '--b': game.accentB }}>
      <div className="game-cover"><span>{game.title.slice(0, 2).toUpperCase()}</span></div>
      <div className="game-label">{offset === 0 ? 'Enter' : game.title}</div>
    </button>
  )
}

function HomeScreen({ view, setView, installed, setInstalled }) {
  const [selectedIndex, setSelectedIndex] = useState(2)
  const [player, setPlayer] = useState(null)
  const selected = games[selectedIndex]

  useEffect(() => {
    const handle = (event) => {
      if (view !== 'All') return
      if (event.key === 'ArrowRight') setSelectedIndex(value => (value + 1) % games.length)
      if (event.key === 'ArrowLeft') setSelectedIndex(value => (value - 1 + games.length) % games.length)
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
      <TopBar view={view} setView={setView} />
      <section className="welcome-block"><h1>Welcome</h1><p>△○×□</p></section>
      <section className="game-shelf">
        {games.map((game, index) => <GameTile key={game.id} game={game} index={index} selectedIndex={selectedIndex} onSelect={(next) => next === selectedIndex ? openSelected() : setSelectedIndex(next)} />)}
      </section>
      <section className="reflection-shelf">
        {games.map((game, index) => <GameTile key={game.id} game={game} index={index} selectedIndex={selectedIndex} onSelect={() => {}} />)}
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

function StoreScreen({ view, setView, installed, setInstalled }) {
  const [wishlist, setWishlist] = useState({})
  const [cart, setCart] = useState({})
  return (
    <main className="home-screen store-mode">
      <div className="soft-bg" />
      <TopBar view={view} setView={setView} />
      <section className="store-wrap">
        <div className="store-hero"><div><span>Featured Store</span><h1>Aurora Store</h1><p>Install games, manage wishlist and cart, and keep the console interface clean.</p></div><div className="store-actions-top"><Button>Wishlist {Object.keys(wishlist).length}</Button><Button className="secondary">Cart {Object.keys(cart).length}</Button></div></div>
        <div className="store-grid">
          {games.map(game => <article className="store-card" key={game.id} style={{ '--a': game.accentA, '--b': game.accentB }}><div className="store-cover"><span>{game.title.slice(0, 2).toUpperCase()}</span></div><h2>{game.title}</h2><p>{game.tag}</p><div className="store-actions"><Button onClick={() => setInstalled(next => ({ ...next, [game.id]: true }))}>{installed[game.id] ? 'Reinstall' : 'Install'}</Button><Button className="secondary" onClick={() => setWishlist(next => ({ ...next, [game.id]: true }))}>Wishlist</Button><Button className="secondary" onClick={() => setCart(next => ({ ...next, [game.id]: true }))}>Cart</Button></div></article>)}
        </div>
      </section>
    </main>
  )
}

function SpotifyScreen({ view, setView }) {
  function connect() {
    const params = new URLSearchParams({ response_type: 'code', client_id: SPOTIFY_CLIENT_ID, redirect_uri: window.location.origin + window.location.pathname, scope: 'user-read-private playlist-read-private' })
    window.location.href = `https://accounts.spotify.com/authorize?${params}`
  }
  return <main className="home-screen"><div className="soft-bg" /><TopBar view={view} setView={setView} /><section className="store-wrap"><div className="store-hero"><div><span>Spotify</span><h1>Console Music</h1><p>Spotify connection is prepared with your Client ID. Add the GitHub Pages redirect URI in the Spotify dashboard.</p></div><Button onClick={connect}>Connect Spotify</Button></div></section></main>
}

function SettingsScreen({ view, setView }) {
  return <main className="home-screen"><div className="soft-bg" /><TopBar view={view} setView={setView} /><section className="store-wrap"><div className="store-hero"><div><span>System</span><h1>Settings</h1><p>Controls, storage, account, controller support and system settings.</p></div></div></section></main>
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [view, setView] = useState('All')
  const [installed, setInstalled] = useState({ ferris: true })

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />
  if (view === 'Store') return <StoreScreen view={view} setView={setView} installed={installed} setInstalled={setInstalled} />
  if (view === 'Settings') return <SettingsScreen view={view} setView={setView} />
  if (view === 'Media') return <SpotifyScreen view={view} setView={setView} />
  return <HomeScreen view={view} setView={setView} installed={installed} setInstalled={setInstalled} />
}

createRoot(document.getElementById('root')).render(<App />)
