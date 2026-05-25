'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CricketNewsWidget() {
  const [news, setNews]     = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cricket/news')
      .then(r => r.json())
      .then(d => { setNews(d.news || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (!loading && news.length === 0) return null

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1B5E20,#2E7D32)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🏏</span>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: 'white' }}>Cricket News</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 1, padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>Live Feed</span>
        </div>
        <Link href="/cricket" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textDecoration: 'none', letterSpacing: 1 }}>
          Live Scores →
        </Link>
      </div>

      {/* News List */}
      {loading ? (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 14, borderRadius: 4, backgroundImage: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', width: i % 2 === 0 ? '75%' : '90%' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {news.slice(0, 8).map((item: any, i: number) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid #F0F0EC', textDecoration: 'none', borderRight: '1px solid #F0F0EC', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F8FFF8')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#0D1B2A', lineHeight: 1.45, marginBottom: 5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.title}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#1B5E20', fontWeight: 600 }}>{item.source}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#aaa' }}>
                  {item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      <div style={{ padding: '10px 16px', background: '#F8FFF8', borderTop: '1px solid #E8F5E9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#aaa' }}>Source: Google News · Updated every 15 min · Links to original sources</span>
        <Link href="/cricket" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#1B5E20', textDecoration: 'none', fontWeight: 600 }}>View Cricket Portal →</Link>
      </div>
    </div>
  )
}
