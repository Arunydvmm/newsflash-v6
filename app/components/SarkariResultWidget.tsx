'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import Link from 'next/link'

const TAB_CONFIG = [
  { key: 'results',    label: '📋 Results',    color: '#C62828' },
  { key: 'jobs',       label: '💼 Latest Jobs', color: '#1B5E20' },
  { key: 'admit-card', label: '🪪 Admit Cards', color: '#1565C0' },
  { key: 'answer-key', label: '🔑 Answer Keys', color: '#6A1B9A' },
]

const TYPE_LABELS: Record<string, string> = {
  results:      'Exam Result',
  jobs:         'Job Notification',
  'admit-card': 'Admit Card',
  'answer-key': 'Answer Key',
}

function DetailModal({ item, tab, onClose }: { item: any; tab: string; onClose: () => void }) {
  const activeTab = TAB_CONFIG.find(t => t.key === tab)!

  // Close on backdrop click
  function handleBackdrop(e: any) {
    if (e.target === e.currentTarget) onClose()
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const fields = [
    { label: 'Type',         value: TYPE_LABELS[tab] || tab },
    { label: 'Organisation', value: item.org },
    { label: 'Posts',        value: item.extra ? `${item.extra} Vacancies` : null },
    { label: 'Date',         value: item.date },
    { label: 'Status',       value: item.status },
    { label: 'Category',     value: item.category },
  ].filter(f => f.value)

  return (
    <div onClick={handleBackdrop} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: 'white', borderRadius: 12, width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.2s ease',
      }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${activeTab.color}, #0D1B2A)`, padding: '18px 20px', position: 'relative' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
            {TYPE_LABELS[tab] || tab}
          </div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.4, paddingRight: 32 }}>
            {item.title}
          </h2>
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Details */}
        <div style={{ padding: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            <tbody>
              {fields.map(f => (
                <tr key={f.label} style={{ borderBottom: '1px solid #F0F0EC' }}>
                  <td style={{ padding: '10px 0', fontSize: 12, color: '#888', width: '35%', fontFamily: 'JetBrains Mono, monospace' }}>{f.label}</td>
                  <td style={{ padding: '10px 0', fontSize: 13, color: '#0D1B2A', fontWeight: 600 }}>{f.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer"
                style={{ background: activeTab.color, color: 'white', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                Official Link →
              </a>
            )}
            <Link href="/sarkari"
              style={{ background: '#F0F0EC', color: '#444', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>
              All Sarkari Jobs
            </Link>
            <button onClick={onClose}
              style={{ background: 'none', border: '1px solid #E0E0E0', color: '#888', padding: '10px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>
              Close
            </button>
          </div>

          {/* Note if no link */}
          {!item.link && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#FFF8E1', borderRadius: 6, fontSize: 12, color: '#E65100', fontFamily: 'JetBrains Mono, monospace' }}>
              ℹ Official link not available — search on sarkariresult.com for more details
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

export default function SarkariResultWidget() {
  const [tab, setTab]           = useState('jobs')
  const [items, setItems]       = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`/api/sarkari/results?type=${tab}`)
      .then(r => r.json())
      .then(d => {
        setItems(d.items || [])
        if (d.error) setError(d.error)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load'); setLoading(false) })
  }, [tab])

  const activeTab = TAB_CONFIG.find(t => t.key === tab)!
  const shimmer = {
    backgroundImage: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  }

  return (
    <>
      {/* Detail Modal */}
      {selected && <DetailModal item={selected} tab={tab} onClose={() => setSelected(null)} />}

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#1B5E20,#2E7D32)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🏛</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: 'white' }}>Sarkari Result</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 1, padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>Live</span>
          </div>
          <Link href="/sarkari" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textDecoration: 'none' }}>
            All Jobs →
          </Link>
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

        {/* Content */}
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
          <div style={{ padding: '24px 20px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#C62828' }}>
            ⚠ {error}
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '24px 20px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#aaa' }}>
            No {tab} found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {items.slice(0, 10).map((item: any, i: number) => (
              <div key={item.id || i}
                style={{ display: 'flex', gap: 12, padding: '11px 20px', borderBottom: '1px solid #F8F8F6', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                onClick={() => setSelected(item)}
                onMouseEnter={e => (e.currentTarget.style.background = '#F8FFF8')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeTab.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B2A', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.title}
                  </div>
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
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#aaa' }}>
            Powered by SarkariResult API · Updated every 30 min
          </span>
          <Link href="/sarkari" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#1B5E20', textDecoration: 'none', fontWeight: 600 }}>
            View All →
          </Link>
        </div>
      </div>
    </>
  )
}
