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
    }
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    localStorage.setItem('nf_dark', next ? '1' : '0')
    // Toggle class on <html> — CSS variables handle everything
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <button onClick={toggle} title={dark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      style={{
        background: dark ? '#1B2B3A' : '#F0F4FF',
        border: `1.5px solid ${dark ? '#2C3E50' : '#C7D2FE'}`,
        borderRadius: 20,
        padding: '6px 14px',
        cursor: 'pointer',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.25s ease',
        flexShrink: 0,
      }}>
      <span style={{ fontSize: 16 }}>{dark ? '☀️' : '🌙'}</span>
      <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: dark ? '#94A3B8' : '#3730A3', fontWeight: 600 }}>
        {dark ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}
