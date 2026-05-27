'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SarkariNewsWidget() {
  const [news, setNews]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sarkari/news')
      .then(r => r.json())
      .then(d => { setNews(d.news || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (!loading && news.length === 0) return null

  const shimmer = {
    backgroundImage: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#E65100,#F57C00)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🏛</span>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: 'white' }}>Sarkari Naukri Updates</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 1, padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>Live Feed</span>
        </div>
        <Link href="/sarkari" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textDecoration: 'none' }}>
          All Jobs →
        </Link>
      </div>

      {/* News list */}
      {loading ? (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 14, borderRadius: 4, width: i % 2 === 0 ? '75%' : '90%', ...shimmer }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {news.slice(0, 8).map((item: any, i: number) => (
            <div key={i}
              onMouseEnter={e => (e.currentTarget.style.background = '#FFF3E0')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid #F0F0EC', borderRight: '1px solid #F0F0EC', textDecoration: 'none', transition: 'background 0.15s' }}>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0D1B2A', lineHeight: 1.45, marginBottom: 5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#E65100', fontWeight: 600 }}>{item.source}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#aaa' }}>
                    {item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                  </span>
                </div>
              </a>
            </div>
          ))}
        </div>
        </div>
      )}

      <div style={{ padding: '10px 16px', background: '#FFF3E0', borderTop: '1px solid #FFE0B2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#aaa' }}>
          Source: Google News · Updated every 15 min · Links to original sources
        </span>
        <Link href="/sarkari" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#E65100', textDecoration: 'none', fontWeight: 600 }}>
          View All Jobs →
        </Link>
      </div>
    </div>
  )
}
