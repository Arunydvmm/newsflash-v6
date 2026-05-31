'use client'
import { useState, useEffect } from 'react'

interface TerminalTextProps {
  text: string
  speed?: number
  onComplete?: () => void
  showCursor?: boolean
}

const TerminalText: React.FC<TerminalTextProps> = ({
  text,
  speed = 50,
  onComplete,
  showCursor = true
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let index = 0
    setDisplayedText('')
    setIsComplete(false)

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index))
        index++
      } else {
        clearInterval(interval)
        setIsComplete(true)
        if (onComplete) onComplete()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, onComplete])

  return (
    <span style={{ fontFamily: 'Courier New, monospace' }}>
      {displayedText}
      {showCursor && (
        <span
          style={{
            animation: 'blink 1s infinite',
            marginLeft: '2px'
          }}
        >
          █
        </span>
      )}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  )
}

export default TerminalText
