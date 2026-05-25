'use client'
// @ts-nocheck
import Link from 'next/link'

const PORTALS = [
  {
    label: 'Cricket Live',
    icon: '🏏',
    desc: 'IPL scores · Points Table · Orange & Purple Cap',
    href: '/cricket',
    bg: 'linear-gradient(135deg,#1B5E20,#2E7D32)',
  },
  {
    label: 'Sarkari Naukri',
    icon: '🏛',
    desc: 'Railway · SSC · UPSC · Bank · Police jobs 2026',
    href: '/sarkari',
    bg: 'linear-gradient(135deg,#E65100,#F57C00)',
  },
]

export default function PortalCards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
      {PORTALS.map(p => (
        <Link key={p.href} href={p.href} style={{ textDecoration: 'none' }}>
          <div
            style={{ background: p.bg, borderRadius: 12, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', transition: 'all 0.25s', cursor: 'pointer', color: 'white' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)' }}
          >
            <span style={{ fontSize: 38 }}>{p.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{p.desc}</div>
            </div>
            <span style={{ fontSize: 22, opacity: 0.8 }}>→</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
