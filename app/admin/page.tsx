'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MatrixRain from '@/components/MatrixRain'
import TerminalText from '@/components/TerminalText'
import styles from '@/styles/admin-login.module.css'

export default function AdminLoginPage() {
  const router = useRouter()
  const [bootSequence, setBootSequence] = useState<string[]>([])
  const [showLogin, setShowLogin] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('ADMIN')
  const [remember, setRemember] = useState(false)
  const [authenticating, setAuthenticating] = useState(false)
  const [authStatus, setAuthStatus] = useState('')
  const [authSuccess, setAuthSuccess] = useState(false)

  const bootLines = [
    'NEWSFLASH SECURE SYSTEM v2.6 ...',
    'Initializing encrypted channel...',
    'Establishing secure connection...',
    'WARNING: Unauthorized access will be prosecuted.',
    'READY.'
  ]

  useEffect(() => {
    let lineIndex = 0
    const interval = setInterval(() => {
      if (lineIndex < bootLines.length) {
        setBootSequence((prev) => [...prev, bootLines[lineIndex]])
        lineIndex++
      } else {
        clearInterval(interval)
        setTimeout(() => setShowLogin(true), 500)
      }
    }, 800)

    return () => clearInterval(interval)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthenticating(true)
    setAuthSuccess(false)
    setAuthStatus('Verifying credentials...')

    setTimeout(() => {
      setAuthStatus('Checking clearance level...')
    }, 1000)

    setTimeout(async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password, remember })
        })

        const data = await res.json()

        if (res.ok) {
          setAuthSuccess(true)
          setAuthStatus(`ACCESS GRANTED — Welcome, ${username}`)
          setTimeout(() => {
            router.push('/admin/dashboard')
          }, 1500)
        } else {
          setAuthSuccess(false)
          setAuthStatus(`ACCESS DENIED — ${data.error || 'Invalid credentials. Attempt logged.'}`)
          setAuthenticating(false)
        }
      } catch (err) {
        setAuthSuccess(false)
        setAuthStatus('ACCESS DENIED — Connection error.')
        setAuthenticating(false)
      }
    }, 2000)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#000000', overflow: 'hidden' }}>
      <MatrixRain />

      {/* Scanline overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px)'
        }}
      />

      {/* CRT flicker effect */}
      <div
        className={styles.flicker}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0.03
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          fontFamily: 'Courier New, monospace'
        }}
      >
        {/* Boot sequence */}
        {!showLogin && (
          <div style={{ color: '#00FF41', fontSize: '14px', textAlign:
