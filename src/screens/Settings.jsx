export default function Settings({mode,setMode,setView}){
return <section className="settings">
<h1>Settings</h1>
<div className="cards">
<article><h2>Slider Design</h2><button onClick={()=>setMode('row')}>Reihe</button><button onClick={()=>setMode('oval')}>Oval</button><p>Aktuell: {mode}</p></article>
<article><h2>Background</h2><button>Warm</button><button>Bright</button></article>
<article><h2>Sound</h2><input type="range" min="0" max="100" defaultValue="65"