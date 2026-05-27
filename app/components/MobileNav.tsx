'use client'
// @ts-nocheck
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Home',     href: '/',          icon: '🏠' },
  { label: 'Cricket',  href: '/cricket',   icon: '🏏' },
  { label: 'Sarkari',  href: '/sarkari',   icon: '🏛' },
  { label: 'Education',href: '/feed/education', icon: '🎓' },
]

export default function MobileNav() {
  const path = usePathname()

  return (
    <>
      {/* Spacer so content isn't hidden behind nav */}
      <div style={{ height: 64, display: 'block' }} className="mobile-nav-spacer" />
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
        background: 'white', borderTop: '1px solid #E5E7EB',
        display: 'flex', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        height: 60,
      }} className="mobile-nav">
        {TABS.map(t => {
          const active = t.href === '/' ? path === '/' : path.startsWith(t.href.split('?')[0])
          return (
            <Link key={t.href} href={t.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, textDecoration: 'none',
              color: active ? '#C62828' : '#9CA3AF',
              background: active ? '#FFF5F5' : 'transparent',
              borderTop: active ? '2px solid #C62828' : '2px solid transparent',
              transition: 'all 0.2s', padding: '6px 0',
            }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: active ? 700 : 400, letterSpacing: 0.5 }}>{t.label}</span>
            </Link>
          )
        })}
      </nav>
      <style>{`
        .mobile-nav-spacer { display: none; }
        @media (max-width: 768px) {
          .mobile-nav-spacer { display: block; }
        }
        @media (min-width: 769px) {
          .mobile-nav { display: none !important; }
        }
      `}</style>
    </>
  )
}
