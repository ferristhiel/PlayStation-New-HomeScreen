import React,{useEffect,useMemo,useState}from'react'
import{createRoot}from'react-dom/client'
import'./styles.css'
import'./ux-fixes.css'

const CID='d06ce2e44ce944c18f421e373e2b086a'
const REDIR=location.origin+location.pathname
const TK='aurora.spotify.token.repair'
const VF='aurora.spotify.verifier.repair'
const SK='aurora.settings.repair'
const base={theme:'dark',carousel:'oval',scale:100,compact:false,m