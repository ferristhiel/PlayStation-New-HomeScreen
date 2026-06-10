export default function TopBar(props){
const home=()=>props.setView("home")
const settings=()=>props.setView("settings")
return <header className="topbar">
<div className="status"><b>19:30</b><button onClick={home}>H</button></div>
<div className="music">Spotify Music</div>
<div className="right"><button>FT</button><button onClick={settings}>Settings</button></div>
</header>
}
