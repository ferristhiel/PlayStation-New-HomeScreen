export default function TopBar({ setView }) {
  return <header className="topbar">
    <div className="status"><b>19:30</b><span className="wifi"><i/><i/><i/></span><button onClick={() => setView('home')}>H</button></div>
    <div className="music"><div className="disc"><span/></div><div><b>Spotify Music</b><small>Connect Spotify device</small><p><button>Back</button><button>Play</button><button>Next</button></p></div></div>
    <div className="right"><button>FT