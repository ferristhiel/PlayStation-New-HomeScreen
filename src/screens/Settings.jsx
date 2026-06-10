export default function Settings(p){
return <section className="settings">
<h1>Settings</h1>
<button onClick={()=>p.setMode('row')}>Reihe</button>
<button onClick={()=>p.setMode('oval')}>Oval</button>
<button onClick={()=>p.setView('home')}>Home</button>
<p>{p.mode}</p>
</section>
}
