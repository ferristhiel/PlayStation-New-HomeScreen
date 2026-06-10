import React,{useEffect,useMemo,useState}from'react'
import{createRoot}from'react-dom/client'
import'./styles.css'
import'./ux-fixes.css'

const CLIENT_ID='d06ce2e44ce944c18f421e373e2b086a'
const REDIRECT_URI=`${window.location.origin}${window.location.pathname}`
const TOKEN_KEY='aurora.spotify.token.v6'
const VERIFIER_KEY='aurora.spotify.verifier.v6'
const SETTINGS_KEY='aurora.settings.v6'
const defaultSettings={theme:'dark',carousel:'oval',volume:68,compact:false,reduceMotion:false,menuScale:100}
const tiles=[
{id:'store',type:'app',title:'Store',tag:'Aurora App',a:'#eee8d8',b:'#f8f3e7'},
{id:'library',type:'app',title