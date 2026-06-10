import React,{useEffect,useMemo,useState}from'react'
import{createRoot}from'react-dom/client'
import'./styles.css'
import'./ux-fixes.css'

const CLIENT_ID='d06ce2e44ce944c18f421e373e2b086a'
const REDIRECT_URI=`${window.location.origin}${window.location.pathname}`
const TOKEN_KEY='aurora.spotify.token.v5'
const VERIFIER_KEY='aurora.spotify.verifier.v5'
const SETTINGS_KEY='aurora.settings.v5'
const defaultSettings={theme:'dark',carousel:'oval',volume:68,compact:false,reduceMotion:false,menuScale:100}
