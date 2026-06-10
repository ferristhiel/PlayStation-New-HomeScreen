export default function TopBar({ setView }) {
  return <header className="topbar">
    <div className="status">
      <b>19:30</b>
      <span className="wifi"><i/><i/><i/></span>
      <button onClick={() => setView('home')}>H</button>
    </div>
    <div className="music">Spotify Music</div>
    <div className="right">
      <button>FT</button>
      <button onClick={() => setView('settings')}>Settings</button>
    </div