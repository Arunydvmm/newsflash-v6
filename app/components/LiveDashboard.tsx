'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function LiveDashboard() {
  const [matches, setMatches] = useState<any[]>([])
  const [jobs, setJobs]       = useState(0)

  useEffect(() => {
    // Fetch live matches count
    fetch('/api/cricket/matches?type=currentMatches')
      .then(r => r.json())
      .then(d => {
        const live = (d.data || []).filter((m: any) => m.matchStarted && !m.matchEnded)
        setMatches(live.slice(0, 2))
      }).catch(() => {})

    // Fetch active jobs count
    fetch('/api/sarkari?limit=1')
      .then(r => r.json())
      .then(d => setJobs(d.total || 0))
      .catch(() => {})
  }, [])

  if (matches.length === 0 && jobs === 0) return null

  return (
    <div style={{ background: '#0D1B2A', borderBottom: '1px solid #1B2B3A', overflowX: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 0, alignItems: 'stretch', minHeight: 38 }}>

        {/* Live matches */}
        {matches.map((m: any, i: number) => (
          <Link key={m.id} href={`/cricket/match/${m.id}`}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px', borderRight: '1px solid #1B2B3A', textDecoration: 'none', flexShrink: 0, transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1B2B3A')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <span style={{ width: 7, height: 7, background: '#C62828', borderRadius: '50%', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#C62828', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 1 }}>Live</div>
              <div style={{ fontSize: 11, color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {m.teams?.join(' vs ') || m.name?.split(',')[0]}
              </div>
              {m.score?.[0] && (
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#A5D6A7' }}>
                  {m.score[0].r}/{m.score[0].w} ({m.score[0].o})
                </div>
              )}
            </div>
          </Link>
        ))}

        {/* Jobs count */}
        {jobs > 0 && (
          <Link href="/sarkari"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRight: '1px solid #1B2B3A', textDecoration: 'none', flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1B2B3A')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <span style={{ fontSize: 14 }}>🏛</span>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#E65100', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 1 }}>Sarkari</div>
              <div style={{ fontSize: 11, color: 'white', fontWeight: 600 }}>{jobs.toLocaleString('en-IN')} Active Jobs</div>
            </div>
          </Link>
        )}

        {/* Spacer + Cricket link */}
        <div style={{ flex: 1 }} />
        <Link href="/cricket" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', textDecoration: 'none', flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1B2B3A')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#4A6080', letterSpacing: 1 }}>Full Scorecard →</span>
        </Link>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  )
}
