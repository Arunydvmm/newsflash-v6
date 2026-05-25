'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('nf_dark')
    if (saved === '1') {
      setDark(true)
      document.documentElement.classList.add('dark')
      document.body.style.background = '#0D1B2A'
      document.body.style.color = '#E5E7EB'
    }
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    localStorage.setItem('nf_dark', next ? '1' : '0')
    document.documentElement.classList.toggle('dark', next)
    document.body.style.background = next ? '#0D1B2A' : '#F4F4F0'
    document.body.style.color = next ? '#E5E7EB' : '#1A1A1A'
  }

  return (
    <button onClick={toggle} title={dark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      style={{
        background: dark ? '#1B2B3A' : '#F0F0EC',
        border: `1px solid ${dark ? '#2C3E50' : '#E0DDD5'}`,
        borderRadius: 20, padding: '6px 12px', cursor: 'pointer',
        fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
        transition: 'all 0.2s',
      }}>
      {dark ? '☀️' : '🌙'}
      <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: dark ? '#A0AEC0' : '#888' }}>
        {dark ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}
