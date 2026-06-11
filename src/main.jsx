import React,{useState}from'react'
import{createRoot}from'react-dom/client'

const games=['Store','Library','Aurora Photos','Spider-Man','Red Dead III','Ferris Game','FC 27','Cyberpunk 2']
const users=['Create User','Chri-TV','moreCHRI-TV','Guest']

function Style(){return <style>{`
*{box-sizing:border-box}html,body,#root{margin:0;width:100%;height:100%;font-family:Inter,system-ui,Arial,sans-serif;color:#10131a}body{overflow:hidden;background:#f3efe6}.app{min-height:100vh;position:relative;overflow:hidden;background:radial-gradient(circle at 50% 18%,#fffdf7 0,#f4efe3 38%,#e8edf3 100%)}button{font:inherit;