'use client'
import { useEffect, useState } from 'react'

export default function TypingText({ text, speed = 50, className = '', onDone }: {
  text: string; speed?: number; className?: string; onDone?: () => void
}) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
        onDone?.()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text])

  return (
    <span className={`font-mono ${className}`}>
      {displayed}
      {!done && <span className="animate-pulse text-[var(--cyber-primary)]">▋</span>}
    </span>
  )
}