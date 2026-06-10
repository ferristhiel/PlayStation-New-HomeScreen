export default function Settings(p){
return <section className="settings">
<h1>Settings</h1>
<div className="cards">
<article><h2>Slider</h2><button onClick={()=>p.setMode('row')}>Reihe</button><button onClick={()=>p.setMode('oval')}>Oval</button><p>{p.mode}</p></article>
<article><h2>Sound</h2><input type="range" defaultValue="65" /></article>
<article><h2>Background</h2><button>Warm</