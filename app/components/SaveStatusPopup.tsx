'use client'
// @ts-nocheck
import { useEffect } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'published' | 'error'

interface Props {
  status: SaveStatus
  message?: string
  onClose?: () => void
}

const CONFIG = {
  saving: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeDasharray="40" strokeDashoffset="10"
          style={{ animation: 'spin 1s linear infinite', transformOrigin: 'center' }} />
      </svg>
    ),
    bg:    'linear-gradient(135deg,#1565C0,#1976D2)',
    title: 'Saving...',
    sub:   'Please wait while we save your changes',
  },
  saved: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)" />
        <path d="M7 12l4 4 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: 'drawCheck 0.4s ease forwards' }} />
      </svg>
    ),
    bg:    'linear-gradient(135deg,#2E7D32,#388E3C)',
    title: 'Saved!',
    sub:   'Your changes have been saved as draft',
  },
  published: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)" />
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="white"
          style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }} />
      </svg>
    ),
    bg:    'linear-gradient(135deg,#C62828,#E53935)',
    title: 'Published!',
    sub:   'Your article is now live on the website',
  },
  error: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)" />
        <path d="M12 7v6M12 17h.01" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    bg:    'linear-gradient(135deg,#B71C1C,#C62828)',
    title: 'Error!',
    sub:   'Something went wrong. Please try again.',
  },
  idle: { icon: null, bg: '', title: '', sub: '' },
}

export default function SaveStatusPopup({ status, message, onClose }: Props) {
  const cfg = CONFIG[status]

  // Auto-close after 3s for success states
  useEffect(() => {
    if (status === 'saved' || status === 'published') {
      const t = setTimeout(() => onClose?.(), 3000)
      return () => clearTimeout(t)
    }
  }, [status, onClose])

  if (status === 'idle') return null

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes drawCheck { from { stroke-dashoffset: 20; stroke-dasharray: 20 } to { stroke-dashoffset: 0; stroke-dasharray: 20 } }
        @keyframes popIn { from { transform: scale(0) } to { transform: scale(1) } }
        @keyframes overlayIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popupIn { from { opacity: 0; transform: translate(-50%,-50%) scale(0.85) } to { opacity: 1; transform: translate(-50%,-50%) scale(1) } }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={status !== 'saving' ? onClose : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          animation: 'overlayIn 0.2s ease',
        }}
      />

      {/* Popup */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 9999,
        background: cfg.bg,
        borderRadius: 20,
        padding: '36px 40px',
        minWidth: 300,
        maxWidth: 380,
        width: '90vw',
        textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        animation: 'popupIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        color: 'white',
      }}>
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {cfg.icon}
          </div>
        </div>

        {/* Title */}
        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          {cfg.title}
        </div>

        {/* Subtitle */}
        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, opacity: 0.85, lineHeight: 1.6, marginBottom: message ? 12 : 0 }}>
          {cfg.sub}
        </div>

        {/* Custom message */}
        {message && (
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 12px', marginTop: 8, opacity: 0.9, wordBreak: 'break-word' }}>
            {message}
          </div>
        )}

        {/* Progress bar for saving */}
        {status === 'saving' && (
          <div style={{ marginTop: 20, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'white', borderRadius: 2, animation: 'shimmerBar 1.5s infinite', backgroundImage: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent)', backgroundSize: '200% 100%' }} />
          </div>
        )}

        {/* Close button for error */}
        {status === 'error' && (
          <button onClick={onClose} style={{ marginTop: 20, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 24px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600 }}>
            Try Again
          </button>
        )}

        {/* Auto-close hint */}
        {(status === 'saved' || status === 'published') && (
          <div style={{ marginTop: 16, fontSize: 11, opacity: 0.6, fontFamily: 'JetBrains Mono, monospace' }}>
            Closing automatically...
          </div>
        )}
      </div>
    </>
  )
}
