'use client'
// @ts-nocheck
import Link from 'next/link'

const PORTALS = [
  {
    label: 'Exam Portal',
    icon: '📚',
    desc: 'Answer Keys · Admit Cards · Results · Notifications',
    href: '/exams',
    bg: 'linear-gradient(135deg,#6A1B9A,#8E24AA)',
  },
  {
    label: 'Cricket Live',
    icon: '🏏',
    desc: 'IPL scores · Points Table · Orange & Purple Cap',
    href: '/cricket',
    bg: 'linear-gradient(135deg,#1B5E20,#2E7D32)',
  },
]

export default function PortalCards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
      {PORTALS.map(p => (
        <Link key={p.href} href={p.href} style={{ textDecoration: 'none' }}>
          <div
            style={{ background: p.bg, borderRadius: 12, padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', transition: 'all 0.25s', cursor: 'pointer', color: 'white', minHeight: '100px', boxSizing: 'border-box' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)' }}
          >
            <span style={{ fontSize: 32, flexShrink: 0 }}>{p.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, marginBottom: 4, wordBreak: 'break-word' }}>{p.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, wordBreak: 'break-word' }}>{p.desc}</div>
            </div>
            <span style={{ fontSize: 20, opacity: 0.8, flexShrink: 0 }}>→</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
