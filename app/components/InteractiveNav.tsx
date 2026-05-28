'use client'
import Link from 'next/link'

export default function InteractiveNav() {
  return (
    <div style={{ background: '#1A1A1A', color: '#999', fontSize: 11, padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'JetBrains Mono, monospace', borderBottom: '1px solid #333' }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#999' }}>
          {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} IST
        </div>
        <span style={{ color: '#C62828', fontWeight: 700 }}>NEWSFLASH IST</span>
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {['Home', 'World', 'Business', 'Tech', 'Sports'].map(c => (
          <Link key={c} href={`/?category=${c}`} style={{ color: '#999', textDecoration: 'none', fontSize: 10, transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.color = '#999')}>
            {c}
          </Link>
        ))}
      </div>
    </div>
  )
}
