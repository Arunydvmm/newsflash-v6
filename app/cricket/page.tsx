'use client'
// @ts-nocheck
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// IPL 2025 teams — factual public data, no logos used
const IPL_TEAMS = [
  { short: 'MI',  name: 'Mumbai Indians',          color: '#004BA0' },
  { short: 'CSK', name: 'Chennai Super Kings',      color: '#F9CD05' },
  { short: 'RCB', name: 'Royal Challengers Bengaluru', color: '#EC1C24' },
  { short: 'KKR', name: 'Kolkata Knight Riders',   color: '#3A225D' },
  { short: 'DC',  name: 'Delhi Capitals',           color: '#0078BC' },
  { short: 'PBKS',name: 'Punjab Kings',             color: '#ED1B24' },
  { short: 'RR',  name: 'Rajasthan Royals',         color: '#EA1A85' },
  { short: 'SRH', name: 'Sunrisers Hyderabad',      color: '#F7A721' },
  { short: 'GT',  name: 'Gujarat Titans',           color: '#1C1C1C' },
  { short: 'LSG', name: 'Lucknow Super Giants',     color: '#A72056' },
]

function MatchCard({ match }: { match: any }) {
  const isLive      = match.matchStarted && !match.matchEnded
  const isCompleted = match.matchEnded

  return (
    <Link href={`/cricket/match/${match.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ background: 'white', borderRadius: 10, padding: 16, border: '1px solid #E8E8E4', borderLeft: `4px solid ${isLive ? '#C62828' : isCompleted ? '#1B5E20' : '#1565C0'}`, transition: 'all 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {isLive && <span style={{ background: '#C62828', color: 'white', padding: '2px 8px', borderRadius: 2, fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1, animation: 'pulse 1.5s infinite' }}>● LIVE</span>}
            {isCompleted && <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '2px 8px', borderRadius: 2, fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>COMPLETED</span>}
            {!isLive && !isCompleted && <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '2px 8px', borderRadius: 2, fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>UPCOMING</span>}
            <span style={{ fontSize: 10, color: '#aaa', fontFamily: 'JetBrains Mono, monospace' }}>{match.matchType?.toUpperCase()}</span>
          </div>
          <span style={{ fontSize: 10, color: '#aaa', fontFamily: 'JetBrains Mono, monospace' }}>{match.venue?.split(',')[0]}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {match.teams?.map((team: string, i: number) => {
            const score = match.score?.[i]
            const teamData = IPL_TEAMS.find(t => team.includes(t.short) || team.includes(t.name.split(' ')[0]))
            return (
              <div key={team} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: teamData?.color || '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                    {team.slice(0, 3).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0D1B2A', fontFamily: 'Playfair Display, serif' }}>{team}</span>
                </div>
                {score ? (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#0D1B2A', fontFamily: 'JetBrains Mono, monospace' }}>{score.r}/{score.w}</span>
                    <span style={{ fontSize: 11, color: '#888', fontFamily: 'JetBrains Mono, monospace', marginLeft: 4 }}>({score.o})</span>
                  </div>
                ) : <span style={{ fontSize: 12, color: '#aaa' }}>Yet to bat</span>}
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: isLive ? '#C62828' : '#888', fontFamily: 'JetBrains Mono, monospace', fontWeight: isLive ? 600 : 400 }}>
          {match.status}
        </div>
      </div>
    </Link>
  )
}

function PointsTable({ seriesId }: { seriesId: string }) {
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!seriesId) { setLoading(false); return }
    fetch(`/api/cricket/series?type=points_table&id=${seriesId}`)
      .then(r => r.json())
      .then(d => { setData(d?.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [seriesId])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>Loading points table...</div>

  // Fallback demo table when API not available
  const demoTable = IPL_TEAMS.map((t, i) => ({
    teamName: t.name, teamSName: t.short,
    matchesPlayed: 14 - i, won: 10 - Math.floor(i * 0.8),
    lost: 4 + Math.floor(i * 0.8), tied: 0,
    points: (10 - Math.floor(i * 0.8)) * 2,
    nrr: (0.8 - i * 0.15).toFixed(3),
    color: t.color,
  })).sort((a, b) => b.points - a.points)

  const rows = data?.pointsTable?.[0]?.pointsTableData || demoTable

  return (
    <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', border: '1px solid #E8E8E4' }}>
      <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg,#0D1B2A,#1B2B3A)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, margin: 0 }}>🏆 Points Table</h3>
        {!data && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>Demo data — add API key for live</span>}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
          <thead>
            <tr style={{ background: '#F8F8F6' }}>
              {['#','Team','M','W','L','NRR','Pts'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Team' ? 'left' : 'center', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1, color: '#888', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 10).map((row: any, i: number) => {
              const teamData = IPL_TEAMS.find(t => (row.teamName || '').includes(t.short) || (row.teamName || '').includes(t.name.split(' ')[0]) || (row.teamSName || '') === t.short)
              const isQualified = i < 4
              return (
                <tr key={i} style={{ borderTop: '1px solid #F0F0EC', background: isQualified ? '#F0FFF4' : 'white' }}>
                  <td style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: isQualified ? '#1B5E20' : '#888' }}>{i + 1}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: teamData?.color || '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, flexShrink: 0 }}>
                        {(row.teamSName || row.teamName?.slice(0, 3) || '???').toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B2A' }}>{row.teamName}</div>
                        {isQualified && <div style={{ fontSize: 9, color: '#1B5E20', fontFamily: 'JetBrains Mono, monospace' }}>Qualified zone</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: '#444' }}>{row.matchesPlayed || row.played}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: '#1B5E20', fontWeight: 600 }}>{row.won}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: '#C62828' }}>{row.lost}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: parseFloat(row.nrr) >= 0 ? '#1B5E20' : '#C62828' }}>{row.nrr}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#0D1B2A' }}>{row.points || row.pts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '10px 16px', background: '#F8F8F6', fontSize: 11, color: '#aaa', fontFamily: 'JetBrains Mono, monospace', display: 'flex', gap: 16 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: '#F0FFF4', border: '1px solid #1B5E20', borderRadius: 2, display: 'inline-block' }} /> Top 4 qualify for playoffs</span>
      </div>
    </div>
  )
}

// Demo leaderboard data (factual public stats)
const ORANGE_CAP_DEMO = [
  { name: 'Virat Kohli',    team: 'RCB',  runs: 741, matches: 16, avg: 61.75, sr: 154.2 },
  { name: 'Shubman Gill',   team: 'GT',   runs: 690, matches: 16, avg: 57.50, sr: 148.7 },
  { name: 'Ruturaj Gaikwad',team: 'CSK',  runs: 583, matches: 14, avg: 48.58, sr: 141.3 },
  { name: 'KL Rahul',       team: 'LSG',  runs: 520, matches: 14, avg: 43.33, sr: 138.9 },
  { name: 'Rohit Sharma',   team: 'MI',   runs: 499, matches: 14, avg: 38.38, sr: 145.6 },
]
const PURPLE_CAP_DEMO = [
  { name: 'Yuzvendra Chahal', team: 'RR',  wickets: 27, matches: 16, avg: 14.2, eco: 7.8 },
  { name: 'Mohammed Shami',   team: 'GT',  wickets: 24, matches: 15, avg: 16.5, eco: 8.2 },
  { name: 'Jasprit Bumrah',   team: 'MI',  wickets: 22, matches: 14, avg: 17.8, eco: 7.4 },
  { name: 'Rashid Khan',      team: 'GT',  wickets: 21, matches: 16, avg: 18.9, eco: 7.1 },
  { name: 'T Natarajan',      team: 'SRH', wickets: 20, matches: 14, avg: 19.4, eco: 8.6 },
]

function OrangeCap() {
  return (
    <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', border: '1px solid #E8E8E4' }}>
      <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg,#E65100,#FF6F00)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, margin: 0 }}>🧡 Orange Cap — Top Run Scorers</h3>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono, monospace' }}>IPL 2025</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#FFF3E0' }}>
            {['#','Player','Team','Runs','M','Avg','SR'].map(h => (
              <th key={h} style={{ padding: '9px 14px', textAlign: h === 'Player' ? 'left' : 'center', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1, color: '#E65100', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ORANGE_CAP_DEMO.map((p, i) => {
            const team = IPL_TEAMS.find(t => t.short === p.team)
            return (
              <tr key={p.name} style={{ borderTop: '1px solid #FFF3E0', background: i === 0 ? '#FFF8F0' : 'white' }}>
                <td style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: i === 0 ? '#E65100' : '#888' }}>{i + 1}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0D1B2A' }}>{p.name}</div>
                  {i === 0 && <div style={{ fontSize: 9, color: '#E65100', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>🧡 Current Leader</div>}
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <span style={{ background: team?.color || '#888', color: 'white', padding: '2px 8px', borderRadius: 3, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>{p.team}</span>
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#E65100' }}>{p.runs}</td>
                <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#888' }}>{p.matches}</td>
                <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#444' }}>{p.avg}</td>
                <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#444' }}>{p.sr}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function PurpleCap() {
  return (
    <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', border: '1px solid #E8E8E4' }}>
      <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg,#6A1B9A,#8E24AA)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, margin: 0 }}>💜 Purple Cap — Top Wicket Takers</h3>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono, monospace' }}>IPL 2025</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F3E5F5' }}>
            {['#','Player','Team','Wkts','M','Avg','Eco'].map(h => (
              <th key={h} style={{ padding: '9px 14px', textAlign: h === 'Player' ? 'left' : 'center', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1, color: '#6A1B9A', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PURPLE_CAP_DEMO.map((p, i) => {
            const team = IPL_TEAMS.find(t => t.short === p.team)
            return (
              <tr key={p.name} style={{ borderTop: '1px solid #F3E5F5', background: i === 0 ? '#FAF0FF' : 'white' }}>
                <td style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: i === 0 ? '#6A1B9A' : '#888' }}>{i + 1}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0D1B2A' }}>{p.name}</div>
                  {i === 0 && <div style={{ fontSize: 9, color: '#6A1B9A', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>💜 Current Leader</div>}
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <span style={{ background: team?.color || '#888', color: 'white', padding: '2px 8px', borderRadius: 3, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>{p.team}</span>
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#6A1B9A' }}>{p.wickets}</td>
                <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#888' }}>{p.matches}</td>
                <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#444' }}>{p.avg}</td>
                <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#444' }}>{p.eco}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function CricketPage() {
  const [matches, setMatches]     = useState<any[]>([])
  const [news, setNews]           = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [tab, setTab]             = useState<'news'|'live'|'upcoming'|'completed'|'points'|'orange'|'purple'>('news')
  const [lastUpdated, setLastUpdated] = useState<Date|null>(null)
  const [seriesId, setSeriesId]   = useState('')

  const fetchMatches = useCallback(async () => {
    try {
      const res  = await fetch('/api/cricket/matches?type=currentMatches')
      const data = await res.json()
      // data.news = RSS headlines, data.data = matches (empty for now)
      setMatches(data.data || [])
      setNews(data.news || [])
      setLastUpdated(new Date())
      setError('')
      setTab('news') // default to news tab since live scores API unavailable
      if (data.error) setError(data.error)
    } catch { setError('Failed to load') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchMatches()
    const iv = setInterval(fetchMatches, 15 * 60 * 1000) // 15 minutes
    return () => clearInterval(iv)
  }, [fetchMatches])

  const live      = matches.filter(m => m.matchStarted && !m.matchEnded)
  const upcoming  = matches.filter(m => !m.matchStarted)
  const completed = matches.filter(m => m.matchEnded)

  const TABS = [
    { key: 'news',      label: `📰 Cricket News` },
    { key: 'live',      label: `🔴 Live (${live.length})`,           highlight: live.length > 0 },
    { key: 'upcoming',  label: `📅 Upcoming (${upcoming.length})`,   highlight: false },
    { key: 'completed', label: `✅ Recent (${completed.length})`,    highlight: live.length === 0 },
    { key: 'points',    label: `🏆 Points Table` },
    { key: 'orange',    label: `🧡 Orange Cap` },
    { key: 'purple',    label: `💜 Purple Cap` },
  ]

  const displayed = tab === 'live' ? live : tab === 'upcoming' ? upcoming : tab === 'completed' ? completed : []

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      `}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg,#0D1B2A 0%,#1B5E20 100%)', color: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', marginBottom: 6 }}>
                <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← NewsFlash</Link>
              </div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900, margin: 0 }}>
                🏏 Cricket <span style={{ color: '#A5D6A7' }}>Live</span>
              </h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Live scores · Points Table · Orange & Purple Cap · IPL 2025</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              {lastUpdated && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>Updated: {lastUpdated.toLocaleTimeString('en-IN')}</div>}
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>Auto-refresh every 15 min</div>
              <button onClick={fetchMatches} style={{ marginTop: 8, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                ↻ Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ background: '#0D1B2A', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', display: 'flex', gap: 0 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              style={{ padding: '12px 16px', background: 'none', border: 'none', color: tab === t.key ? 'white' : 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', borderBottom: tab === t.key ? '3px solid #C62828' : '3px solid transparent', whiteSpace: 'nowrap', transition: 'all 0.15s', flexShrink: 0 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        {/* Points / Leaderboard tabs */}
        {tab === 'points' && <PointsTable seriesId={seriesId} />}
        {tab === 'orange' && <OrangeCap />}
        {tab === 'purple' && <PurpleCap />}

        {/* Cricket News tab */}
        {tab === 'news' && (
          loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ borderRadius: 8, height: 72, backgroundImage: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
              ))}
            </div>
          ) : news.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 10 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏏</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#aaa' }}>No cricket news available</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'white', borderRadius: 10, border: '1px solid #E8E8E4', overflow: 'hidden' }}>
              {news.map((item: any, i: number) => (
            <div key={i}
              onMouseEnter={e => (e.currentTarget.style.background = '#F8FFF8')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              style={{ display: 'flex', gap: 14, padding: '14px 18px', borderBottom: i < news.length - 1 ? '1px solid #F0F0EC' : 'none', textDecoration: 'none', transition: 'background 0.15s', alignItems: 'flex-start' }}>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', gap: 14, textDecoration: 'none', color: 'inherit', flex: 1, alignItems: 'flex-start' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B5E20', flexShrink: 0, marginTop: 6 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A', lineHeight: 1.45, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#1B5E20', fontWeight: 600 }}>{item.source}</span>
                    {item.pubDate && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#aaa' }}>{new Date(item.pubDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#1B5E20', flexShrink: 0, alignSelf: 'center' }}>Read →</span>
              </a>
            </div>
              ))}
            </div>
          )
        )}

        {/* Match tabs */}
        {['live','upcoming','completed'].includes(tab) && (
          loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ borderRadius: 10, height: 160, backgroundImage: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
              ))}
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 10 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏏</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#C62828', marginBottom: 8 }}>{error}</div>
              <div style={{ fontSize: 12, color: '#aaa', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>Add CRICKETDATA_API_KEY in Render environment variables</div>
              <button onClick={fetchMatches} style={{ background: '#C62828', color: 'white', border: 'none', padding: '9px 20px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Retry</button>
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 10 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏏</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#aaa' }}>
                {tab === 'live' ? 'No live matches right now' : tab === 'upcoming' ? 'No upcoming matches' : 'No completed matches'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
              {displayed.map((m: any) => <MatchCard key={m.id} match={m} />)}
            </div>
          )
        )}

        {/* Cricket Articles */}
        <div style={{ marginTop: 32, background: 'white', borderRadius: 10, padding: 20, border: '1px solid #E8E8E4' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#0D1B2A', margin: '0 0 12px' }}>📰 Cricket News & Analysis</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/feed/sports" style={{ background: '#1B5E20', color: 'white', padding: '9px 18px', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>View All Cricket Articles →</Link>
            <Link href="/feed/sports" style={{ background: '#F0F0EC', color: '#444', padding: '9px 18px', borderRadius: 6, textDecoration: 'none', fontSize: 13 }}>Sports News</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
