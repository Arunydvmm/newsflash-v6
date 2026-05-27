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

function AIDetails({ details, color }: { details: any; color: string }) {
  if (!details) return null
  const d = details

  return (
    <div>
      {d.overview && (
        <div style={{ background: '#F8FFF8', border: `1px solid ${color}30`, borderLeft: `3px solid ${color}`, borderRadius: 6, padding: '12px 14px', marginBottom: 18, fontSize: 13, color: '#333', lineHeight: 1.7 }}>
          {d.overview}
        </div>
      )}

      {/* Key Info */}
      <Section title="📋 Key Information">
        <InfoRow label="Organisation" value={d.organisation} />
        <InfoRow label="Post Name" value={d.postName} />
        <InfoRow label="Total Vacancies" value={d.totalVacancy} />
        <InfoRow label="Salary / Pay Scale" value={d.salary} />
        <InfoRow label="Official Website" value={d.officialWebsite} />
      </Section>

      {/* Eligibility */}
      {d.eligibility && (d.eligibility.education || d.eligibility.age) && (
        <Section title="🎓 Eligibility">
          <InfoRow label="Education" value={d.eligibility.education} />
          <InfoRow label="Age Limit" value={d.eligibility.age} />
          <InfoRow label="Experience" value={d.eligibility.experience} />
        </Section>
      )}

      {/* Important Dates */}
      {d.importantDates && Object.values(d.importantDates).some(v => v && v !== 'Check official notification') && (
        <Section title="📅 Important Dates">
          <InfoRow label="Notification" value={d.importantDates.notificationDate} />
          <InfoRow label="Apply Start" value={d.importantDates.applicationStart} />
          <InfoRow label="Last Date" value={d.importantDates.lastDate} />
          <InfoRow label="Exam Date" value={d.importantDates.examDate} />
          <InfoRow label="Result Date" value={d.importantDates.resultDate} />
        </Section>
      )}

      {/* Application Fee */}
      {d.applicationFee && (d.applicationFee.general || d.applicationFee.scSt) && (
        <Section title="💰 Application Fee">
          <InfoRow label="General / OBC" value={d.applicationFee.general} />
          <InfoRow label="SC / ST / PH" value={d.applicationFee.scSt} />
          <InfoRow label="Payment Mode" value={d.applicationFee.paymentMode} />
        </Section>
      )}

      {/* Selection Process */}
      {d.selectionProcess?.length > 0 && (
        <Section title="🏆 Selection Process">
          <ol style={{ paddingLeft: 18, margin: 0 }}>
            {d.selectionProcess.map((step: string, i: number) => (
              <li key={i} style={{ fontSize: 13, color: '#333', padding: '4px 0', lineHeight: 1.5 }}>{step}</li>
            ))}
          </ol>
        </Section>
      )}

      {/* How to Apply */}
      {d.howToApply?.length > 0 && (
        <Section title="📝 How to Apply">
          <ol style={{ paddingLeft: 18, margin: 0 }}>
            {d.howToApply.map((step: string, i: number) => (
              <li key={i} style={{ fontSize: 13, color: '#333', padding: '4px 0', lineHeight: 1.5 }}>{step}</li>
            ))}
          </ol>
        </Section>
      )}

      {/* Additional Info */}
      {d.additionalInfo && d.additionalInfo !== 'Check official notification' && (
        <Section title="ℹ Additional Info">
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, margin: 0 }}>{d.additionalInfo}</p>
        </Section>
      )}

      {/* Disclaimer */}
      <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 6, padding: '10px 14px', fontSize: 11, color: '#E65100', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6 }}>
        ⚠ AI-generated details — always verify from official sources before applying
      </div>
    </div>
  )
}

function DetailModal({ item, tab, onClose }: { item: any; tab: string; onClose: () => void }) {
  const activeTab  = TAB_CONFIG.find(t => t.key === tab)!
  const [aiData, setAiData]       = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(true)
  const [aiError, setAiError]     = useState('')

  // Fetch AI details on mount
  useEffect(() => {
    setAiLoading(true)
    setAiError('')
    fetch('/api/sarkari/ai-detail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: item.title, org: item.org, type: tab, date: item.date, extra: item.extra }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) setAiError(d.error)
        else setAiData(d.details)
        setAiLoading(false)
      })
      .catch(() => { setAiError('Failed to load AI details'); setAiLoading(false) })
  }, [item.title, tab])

  // Close on backdrop
  function handleBackdrop(e: any) { if (e.target === e.currentTarget) onClose() }

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div onClick={handleBackdrop} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: 'white', borderRadius: 14, width: '100%', maxWidth: 580,
        maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${activeTab.color}, #0D1B2A)`, padding: '18px 20px', flexShrink: 0, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, padding: '2px 8px', borderRadius: 3, letterSpacing: 1 }}>
              {TYPE_LABELS[tab] || tab}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, padding: '2px 8px', borderRadius: 3, letterSpacing: 1 }}>
              🤖 AI Powered
            </span>
          </div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.4, paddingRight: 36 }}>
            {item.title}
          </h2>
          {item.org && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{item.org}</div>}
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {aiLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>🤖</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#0D1B2A', marginBottom: 8 }}>
                AI is researching this notification...
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#888', marginBottom: 24 }}>
                Searching public sources for eligibility, dates, salary & more
              </div>
              {/* Animated dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: activeTab.color,
                    animation: `bounce 1.2s ease infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
              <div style={{ marginTop: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#bbb' }}>
                Powered by Groq AI · LLaMA 3 70B
              </div>
            </div>
          ) : aiError ? (
            <div>
              <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 8, padding: '16px', marginBottom: 16, fontSize: 13, color: '#C62828', fontFamily: 'JetBrains Mono, monospace' }}>
                ⚠ {aiError}
              </div>
              {/* Show basic info as fallback */}
              <Section title="📋 Basic Information">
                <InfoRow label="Organisation" value={item.org} />
                <InfoRow label="Posts" value={item.extra ? `${item.extra} Vacancies` : null} />
                <InfoRow label="Date" value={item.date} />
                <InfoRow label="Status" value={item.status} />
              </Section>
            </div>
          ) : (
            <AIDetails details={aiData} color={activeTab.color} />
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #F0F0EC', display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0, background: '#FAFAF8' }}>
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer"
              style={{ background: activeTab.color, color: 'white', padding: '9px 18px', borderRadius: 6, textDecoration: 'none', fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
              Official Link →
            </a>
          )}
          <Link href="/sarkari"
            style={{ background: '#F0F0EC', color: '#444', padding: '9px 16px', borderRadius: 6, textDecoration: 'none', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
            All Jobs
          </Link>
          <button onClick={onClose}
            style={{ background: 'none', border: '1px solid #E0E0E0', color: '#888', padding: '9px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', marginLeft: 'auto' }}>
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce  { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
      `}</style>
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
      .then(d => { setItems(d.items || []); if (d.error) setError(d.error); setLoading(false) })
      .catch(() => { setError('Failed to load'); setLoading(false) })
  }, [tab])

  const activeTab = TAB_CONFIG.find(t => t.key === tab)!
  const shimmer = { backgroundImage: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }

  return (
    <>
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
          <Link href="/sarkari" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textDecoration: 'none' }}>All Jobs →</Link>
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
                onClick={() => setSelected(item)}
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
                <span style={{ background: activeTab.color + '15', color: activeTab.color, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, padding: '4px 10px', borderRadius: 4, flexShrink: 0, fontWeight: 600, border: `1px solid ${activeTab.color}30`, display: 'flex', alignItems: 'center', gap: 4 }}>
                  🤖 View
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: '10px 16px', background: '#F8FFF8', borderTop: '1px solid #E8F5E9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#aaa' }}>AI-powered details · Click any item to view full info</span>
          <Link href="/sarkari" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#1B5E20', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
        </div>
      </div>
    </>
  )
}
