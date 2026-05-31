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
    setAuthStatus('Verifying credentials...')

    setTimeout(() => {
      setAuthStatus('Checking clearance level...')
    }, 1000)

    setTimeout(async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role, remember })
        })

        const data = await res.json()

        if (res.ok) {
          setAuthSuccess(true)
          setAuthStatus(`ACCESS GRANTED — Welcome, ${username}`)
          setTimeout(() => {
            router.push('/admin/dashboard')
          }, 2000)
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
          <div style={{ color: '#00FF41', fontSize: '14px', textAlign: 'left', maxWidth: '600px' }}>
            {bootSequence.map((line, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <TerminalText text={line} speed={30} />
              </div>
            ))}
          </div>
        )}

        {/* Login form */}
        {showLogin && (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid #00FF41',
              padding: '32px',
              borderRadius: '4px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)'
            }}
          >
            {/* Logo with glitch effect */}
            <div
              className={styles.glitch}
              style={{
                color: '#C62828',
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '32px',
                textAlign: 'center'
              }}
            >
              NEWSFLASH
            </div>

            {!authenticating && !authStatus ? (
              <form onSubmit={handleLogin}>
                {/* Username */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#00FF41', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                    &gt; USER_ID:
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: '#000000',
                      border: 'none',
                      borderBottom: '1px solid #00FF41',
                      color: '#00FF41',
                      padding: '8px 0',
                      fontSize: '14px',
                      fontFamily: 'Courier New, monospace',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Password */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#00FF41', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                    &gt; PASS_KEY:
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: '#000000',
                      border: 'none',
                      borderBottom: '1px solid #00FF41',
                      color: '#00FF41',
                      padding: '8px 0',
                      fontSize: '14px',
                      fontFamily: 'Courier New, monospace',
                      outline: 'none',
                      letterSpacing: '4px'
                    }}
                  />
                </div>

                {/* Role selector */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#00FF41', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                    &gt; CLEARANCE_LEVEL:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#000000',
                      border: 'none',
                      borderBottom: '1px solid #00FF41',
                      color: '#00FF41',
                      padding: '8px 0',
                      fontSize: '14px',
                      fontFamily: 'Courier New, monospace',
                      outline: 'none'
                    }}
                  >
                    <option value="ADMIN">[ADMIN]</option>
                    <option value="EDITOR">[EDITOR]</option>
                    <option value="WRITER">[WRITER]</option>
                  </select>
                </div>

                {/* Remember checkbox */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ color: '#00FF41', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    &gt; KEEP_SESSION_ALIVE:
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      style={{ accentColor: '#00FF41' }}
                    />
                    [{remember ? 'YES' : 'NO'}]
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#000000',
                    border: '1px solid #00FF41',
                    color: '#00FF41',
                    padding: '12px',
                    fontSize: '14px',
                    fontFamily: 'Courier New, monospace',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#00FF41'
                    e.currentTarget.style.color = '#000000'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#000000'
                    e.currentTarget.style.color = '#00FF41'
                  }}
                >
                  &gt; AUTHENTICATE
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    color: authSuccess ? '#00FF41' : '#C62828',
                    fontSize: '14px',
                    marginBottom: '16px'
                  }}
                >
                  <TerminalText text={authStatus} speed={30} />
                </div>
                {authSuccess && (
                  <div style={{ color: '#00FF41', fontSize: '12px' }}>
                    Redirecting to dashboard...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
