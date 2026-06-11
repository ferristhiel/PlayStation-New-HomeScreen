import{useState}from'react'

export default function App(){
 const[view,setView]=useState('home')
 const cards=['Store','Photos','Spider','Ferris','FC27']
 return <main>
  <header className="topbar">
   <button className="status" onClick={()=>setView('home')}>H 19:30</button>
   <div className="music">Spotify Music</div>
   <button className="right" onClick={()=>setView('settings')}>Settings</button>
  </header>
  {view==='settings'?<section className="settings"><h1>Settings