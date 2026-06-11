import{useState}from'react'

export default function App(){
 const[view,setView]=useState('home')
 const cards=['Store','Photos','Spider','Ferris','FC27']
 return <main className="app">
  <header className="topbar">
   <button onClick={()=>setView('home')}>H</button>
   <div>Spotify Music</div>
   <button onClick={()=>setView('settings')}>Settings</button>
  </header>
  {view==='settings'?<section className="panel"><h1>Settings</h1><button onClick={()=>setView('home')}>Back</button></section>:<section><h1>Welcome</h1><div className="cards">{cards.map(x=><button className="card" key={x}>{x}</button>)}</div><div className="panel"><h2>Ferris Game</h2><button>Start</button></div></section>}
 </main>
}