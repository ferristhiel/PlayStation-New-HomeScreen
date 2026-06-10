import React,{useEffect,useMemo,useState}from'react'
import{createRoot}from'react-dom/client'
import'./styles.css'
import'./ux-fixes.css'

const CLIENT_ID='d06ce2e44ce944c18f421e373e2b086a'
const REDIRECT_URI=`${window.location.origin}${window.location.pathname}`
const TOKEN_KEY='aurora.spotify.token.v4'
const VERIFIER_KEY='aurora.spotify.verifier.v4'
const SETTINGS_KEY='aur