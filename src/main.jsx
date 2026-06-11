import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.css'

function App() {
  const items = ['Store','Library','Photos','Spider','Ferris','FC27']
  return (
    <main className="app">
      <header className="top">
        <div className="left">12:07 ))) H</div>
        <div className="music">Spotify Player · Connect</div>
        <div className="right">FT Settings</div>
      </header>
      <section className="hero