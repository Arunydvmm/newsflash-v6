'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import Link from 'next/link'

const TOPIC_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; gradient: string; searchLink: string }> = {
  education: { label: 'Education News',   icon: '🎓', color: '#283593', bg: '#E8EAF6', gradient: 'linear-gradient(135deg,#283593,#3949AB)', searchLink: '/?category=Education' },
  sarkari:   { label: 'Sarkari Updates',  icon: '🏛', color: '#E65100', bg: '#FFF3E0', gradient: 'linear-gradient(135deg,#E65100,#F57C00)', searchLink: '/sarkari' },
  india:     { label: 'India News',       icon: '🇮🇳', color: '#C62828', bg: '#FFEBEE', gradient: 'linear-gradient(135deg,#C62828,#E53935)', searchLink: '/?category=India' },
  business:  { label: 'Business News',   icon: '📈', color: '#2E7D32', bg: '#E8F5E9', gradient: 'linear-gradient(135deg,#2E7D32,#388E3C)', searchLink: '/?category=Business' },
  technology:{ label: 'Tech News',       icon: '💻', color: '#6A1B9A', bg: '#F3E5F5', gradient: 'linear-gradient(135deg,#6A1B9A,#7B1FA2)', searchLink: '/?category=Technology' },
  cricket:   { label: 'Cricket News',    icon: '🏏', color: '#1B5E20', bg: '#E8F5E9', gradient: 'linear-gradient(135deg,#1B5E20,#2E7D32)', searchLink: '/cricket' },
}

export default function NewsFeedWidget({ topic = 'education', limit = 8, compact = false }: { topic?: string; limit?: number; compact?: boolean }) {
  const [news, setNews]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const cfg = TOPIC_CONFIG[topic] || TOPIC_CONFIG.education

  useEffect(() => {
    fetch(`/api/news-feed?topic=${topic}&limit=${limit}`)
      .then(r => r.json())
      .then(d => { setNews(d.news || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [topic, limit])

  if (!loading && news.length === 0) return null

  const shimmer = { backgroundImage: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: compact ? 0 : 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div style={{ background: cfg.gradient, padding: compact ? '12px 16px' : '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: compact ? 18 : 20 }}>{cfg.icon}</span>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: compact ? 14 : 16, fontWeight: 700, color: 'white' }}>{cfg.label}</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 1, padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>Live Feed</span>
        </div>
        <Link href={cfg.searchLink} style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textDecoration: 'none', letterSpacing: 0.5 }}>
          View All →
        </Link>
      </div>

      {/* News Items */}
      {loading ? (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 14, borderRadius: 4, width: i % 2 === 0 ? '88%' : '72%', ...shimmer }} />
          ))}
        </div>
      ) : (
        <div style={{ display: compact ? 'flex' : 'grid', flexDirection: compact ? 'column' : undefined, gridTemplateColumns: compact ? undefined : 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {news.map((item: any, i: number) => (
            <div key={i}
              onMouseEnter={e => (e.currentTarget.style.background = cfg.bg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: compact ? '10px 16px' : '12px 16px', borderBottom: '1px solid #F0F0EC', borderRight: compact ? 'none' : '1px solid #F0F0EC', textDecoration: 'none', transition: 'background 0.15s', cursor: 'pointer' }}>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontSize: compact ? 12 : 13, fontWeight: 500, color: '#0D1B2A', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                  {item.source && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: cfg.color, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{item.source}</span>}
                  {item.pubDate && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#aaa', flexShrink: 0 }}>
                    {new Date(item.pubDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>}
                </div>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '8px 16px', background: cfg.bg, borderTop: `1px solid ${cfg.color}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#aaa' }}>
          Source: Google News · Updated every 15 min · Links to original sources
        </span>
        <Link href={cfg.searchLink} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: cfg.color, textDecoration: 'none', fontWeight: 600 }}>
          {cfg.label} →
        </Link>
      </div>
    </div>
  )
}
