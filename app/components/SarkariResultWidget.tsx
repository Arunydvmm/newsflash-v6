'use client'
// @ts-nocheck
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const TAB_CONFIG = [
  { key: 'results',    label: '📋 Results',    color: '#C62828' },
  { key: 'jobs',       label: '💼 Latest Jobs', color: '#1B5E20' },
  { key: 'admit-card', label: '🪪 Admit Cards', color: '#1565C0' },
  { key: 'answer-key', label: '🔑 Answer Keys', color: '#6A1B9A' },
]

const TYPE_LABELS: Record<string, string> = {
  results: 'Exam Result', jobs: 'Job Notification',
  'admit-card': 'Admit Card', 'answer-key': 'Answer Key',
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#888', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #F0F0EC' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: any }) {
  if (!value || value === 'Check official notification' || value === 'Not specified') return null
  return (
    <div style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid #F8F8F6' }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#888', width: 130, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#0D1B2A', fontWeight: 500, flex: 1 }}>{value}</span>
    </div>
  )
}

export default function SarkariResultWidget() {
  const [tab, setTab]           = useState('jobs')
  const [items, setItems]       = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`/api/sarkari/results?type=${tab}`)
      .then(r => r.json())
      .then(d => { setItems(d.items || []); if (d.error) setError(d.error); setLoading(false) })
      .catch(() => { setError('Failed to load'); setLoading(false) })
  }, [tab])

  const activeTab = TAB_CONFIG.find(t => t.key === tab)!
  const shimmer = { backgroundImage: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }

  const handleViewClick = (item: any) => {
    // Store item data in sessionStorage for the detail page
    sessionStorage.setItem(`sarkari-result-${item.id || item.title}`, JSON.stringify({ ...item, tab }))
    // Navigate to dedicated page
    window.location.href = `/sarkari-result/${item.id || item.title.replace(/\s+/g, '-').toLowerCase()}`
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#1B5E20,#2E7D32)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🏛</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: 'white' }}>Sarkari Result</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 1, padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>Live</span>
          </div>
          <Link href="/exam-portal" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textDecoration: 'none' }}>All Jobs →</Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #F0F0EC', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TAB_CONFIG.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap', flexShrink: 0, borderBottom: tab === t.key ? `3px solid ${t.color}` : '3px solid transparent', color: tab === t.key ? t.color : '#888', fontWeight: tab === t.key ? 700 : 400, transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, ...shimmer }} />
                <div style={{ height: 13, borderRadius: 4, flex: 1, ...shimmer }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: '24px 20px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#C62828' }}>⚠ {error}</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '24px 20px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#aaa' }}>No {tab} found</div>
        ) : (
          <div>
            {items.slice(0, 10).map((item: any, i: number) => (
              <div key={item.id || i}
                onClick={() => handleViewClick(item)}
                style={{ display: 'flex', gap: 12, padding: '11px 20px', borderBottom: '1px solid #F8F8F6', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F8FFF8')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeTab.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B2A', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                    {item.org && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#888' }}>{item.org}</span>}
                    {item.extra && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: activeTab.color, fontWeight: 600 }}>{item.extra} Posts</span>}
                    {item.date && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#C62828' }}>{item.date}</span>}
                  </div>
                </div>
                <span style={{ background: activeTab.color + '15', color: activeTab.color, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, padding: '4px 10px', borderRadius: 4, flexShrink: 0, fontWeight: 600, border: `1px solid ${activeTab.color}30` }}>
                  View
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: '10px 16px', background: '#F8FFF8', borderTop: '1px solid #E8F5E9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#aaa' }}>Powered by Sarkari Result · Click any item to view full info</span>
          <Link href="/exam-portal" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#1B5E20', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
        </div>
      </div>
    </div>
  )
}
