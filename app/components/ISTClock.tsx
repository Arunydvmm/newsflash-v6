'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'

export default function ISTClock() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  function update() {
    const now = new Date()
    // IST = UTC + 5:30
    const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000))
    setTime(ist.toISOString().slice(11, 19)) // HH:MM:SS
    setDate(now.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Kolkata',
    }))
  }

  useEffect(() => {
    update()
    const iv = setInterval(update, 1000)
    return () => clearInterval(iv)
  }, [])

  if (!time) return null

  return (
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#555555', display: 'flex', alignItems: 'center', gap: 6 }}>
      <span>{date}</span>
      <span style={{ color: '#999999' }}>·</span>
      <span style={{ color: '#D4A017', fontWeight: 600 }}>{time}</span>
      <span style={{ color: '#4A6080' }}>IST</span>
    </span>
  )
}
