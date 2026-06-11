import{useState}from'react'

export default function App(){
 const[view,setView]=useState('home')
 const[mode,setMode]=useState('oval')
 return <main className={'app '+mode}>
  <header className="topbar">
   <div className="pill"><b>19:30</b><button onClick={()=>setView('home')}>H</button></div>
   <div className="player"><b>Spotify Music</b><span>Connect device</span></div>
   <div className="pill"><button>FT</button><button onClick={()=>setView('settings