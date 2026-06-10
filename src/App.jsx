import{useState}from'react'
import TopBar from'./components/TopBar.jsx'
import Home from'./screens/Home.jsx'
import Settings from'./screens/Settings.jsx'

export default function App(){
 const[view,setView]=useState('home')
 const[mode,setMode]=useState('oval')
 return <main className={'app '+mode}>
  <TopBar setView={setView}/>
  {view==='settings'?<Settings mode={mode} setMode={setMode} setView={setView}/>:<Home setView={setView}/>} 
 </main>
}
