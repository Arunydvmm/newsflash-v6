'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import GlitchText from '@/components/cyber/GlitchText'
import CyberInput from '@/components/cyber/CyberInput'
import CyberButton from '@/components/cyber/CyberButton'
import TypingText from '@/components/cyber/TypingText'

const BOOT_LINES = [
  'NEWSFLASH OS v6.0.1 — initializing...',
  'Loading secure kernel modules...',
  'Establishing encrypted channel...',
  'Authentication gateway: ONLINE',
  'Access terminal ready.',
]

export default function LoginPage() {
  const router = useRouter()
  const [bootStep, setBootStep] = useState(0)
  const [bootDone, setBootDone] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scanLine, setScanLine] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine(p => (p + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  async function handleLogin() {
    setError('')
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      if (res?.error) {
        setError('ACCESS DENIED — invalid credentials')
        setLoading(false)
      } else {
        router.push('/admin/dashboard')
      }
    } catch {
      setError('CONNECTION FAILED — retry')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--cyber-bg)] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `
          linear-gradient(var(--cyber-primary) 1px, transparent 1px),
          linear-gradient(90deg, var(--cyber-primary) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />

      {/* Moving scan line */}
      <div
        className="absolute left-0 right-0 h-px bg-[var(--cyber-primary)] opacity-10 pointer-events-none transition-none"
        style={{ top: `${scanLine}%` }}
      />

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[var(--cyber-primary)] opacity-60" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[var(--cyber-primary)] opacity-60" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[var(--cyber-primary)] opacity-60" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[var(--cyber-primary)] opacity-60" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo */}
        <div className="text-center space-y-2">
          <GlitchText text="NEWSFLASH" className="text-4xl tracking-widest" />
          <p className="font-mono text-xs text-[var(--cyber-text-dim)] tracking-widest uppercase">
            Secure Admin Terminal
          </p>
        </div>

        {/* Boot sequence */}
        {!bootDone ? (
          <div className="border border-[var(--cyber-border)] bg-[var(--cyber-surface)] p-4 space-y-1.5">
            <p className="font-mono text-xs text-[var(--cyber-text-dim)] mb-3">
              // system boot
            </p>
            {BOOT_LINES.slice(0, bootStep + 1).map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[var(--cyber-success)] font-mono text-xs">✓</span>
                {i === bootStep ? (
                  <TypingText
                    text={line}
                    speed={30}
                    className="text-xs text-[var(--cyber-text)]"
                    onDone={() => {
                      setTimeout(() => {
                        if (bootStep < BOOT_LINES.length - 1) {
                          setBootStep(s => s + 1)
                        } else {
                          setBootDone(true)
                        }
                      }, 300)
                    }}
                  />
                ) : (
                  <span className="font-mono text-xs text-[var(--cyber-text)]">{line}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Login form — appears after boot */
          <div className="border border-[var(--cyber-border)] bg-[var(--cyber-surface)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--cyber-primary)] to-transparent" />

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--cyber-primary)] uppercase tracking-widest">
                  // authenticate
                </span>
                <span className="font-mono text-xs text-[var(--cyber-text-dim)]">
                  {new Date().toISOString().slice(0, 19)}Z
                </span>
              </div>

              <CyberInput
                label="user_id"
                type="text"
                value={email}
                onChange={setEmail}
                placeholder="admin"
                prefix="$"
              />

              <CyberInput
                label="access_key"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••••••"
                prefix="#"
              />

              {error && (
                <div className="border border-[var(--cyber-danger)] bg-[#ff386011] px-3 py-2">
                  <p className="font-mono text-xs text-[var(--cyber-danger)]">{'>'}_  {error}</p>
                </div>
              )}

              <CyberButton
                type="submit"
                onClick={handleLogin}
                loading={loading}
                className="w-full justify-center py-3"
              >
                {loading ? 'AUTHENTICATING...' : 'INITIATE ACCESS'}
              </CyberButton>

              <p className="font-mono text-xs text-[var(--cyber-text-dim)] text-center">
                UNAUTHORIZED ACCESS IS MONITORED AND LOGGED
              </p>
            </div>
          </div>
        )}

        {/* Bottom status bar */}
        <div className="flex items-center justify-between font-mono text-xs text-[var(--cyber-text-dim)]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyber-success)] animate-pulse" />
            SECURE CONNECTION
          </span>
          <span>TLS 1.3 — AES-256</span>
        </div>
      </div>
    </div>
  )
}