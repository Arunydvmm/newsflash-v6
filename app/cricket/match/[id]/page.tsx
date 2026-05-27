'use client'
// @ts-nocheck
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function MatchDetailPage() {
  const { id } = useParams()
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/cricket/match/${id}`)
      const d   = await res.json()
      if (d.error && !d.name) {
        setError(d.error)
      } else {
        setData(d)
        setError('')
      }
    } catch {
      setError('Failed to load match data')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
    // Auto-refresh every 30s for live matches
    const interval = setInterval(fetchData, 30_000)
    return () => clearInterval(interval)
  }, [fetchData])

  const isLive = data?.isLive

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #0D1B2A 100%)', color: 'white', padding: '14px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>NewsFlash</Link>
            <span style={{ margin: '0 8px', color: 'rgba(255,255,255,0.3)' }}>›</span>
            <Link href="/cricket" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Cricket</Link>
            <span style={{ margin: '0 8px', color: 'rgba(255,255,255,0.3)' }}>›</span>
            <span style={{ color: 'white' }}>Match Detail</span>
          </div>
          {data && (
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                {isLive && (
                  <span style={{ background: '#C62828', color: 'white', padding: '2px 8px', borderRadius: 2, fontSize: 9, fontFamily: 'JetBrains Mono, monospace', animation: 'pulse 2s infinite' }}>
                    ● LIVE
                  </span>
                )}
                {data.series && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {data.series}
                  </span>
                )}
                {data.venue && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
                    · {data.venue}
                  </span>
                )}
              </div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, margin: 0 }}>
                {data.name}
              </h1>
              {data.statusText && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{data.statusText}</div>
              )}
            </div>
          )}
          {loading && !data && (
            <div style={{ height: 28, width: 300, borderRadius: 4, background: 'rgba(255,255,255,0.1)', animation: 'pulse 1.5s infinite' }} />
          )}
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '20px' }}>
        {loading && !data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2].map(i => (
              <div key={i} style={{ borderRadius: 8, height: 120, backgroundImage: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))}
          </div>
        ) : error && !data ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 8 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏏</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#C62828', marginBottom: 8 }}>{error}</div>
            <div style={{ fontSize: 12, color: '#aaa', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>
              Match data may not be available for this match ID
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={fetchData} style={{ background: '#C62828', color: 'white', border: 'none', padding: '9px 20px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                Retry
              </button>
              <Link href="/cricket" style={{ background: '#F0F0EC', color: '#444', padding: '9px 20px', borderRadius: 4, textDecoration: 'none', fontSize: 12 }}>
                ← Back to Cricket
              </Link>
            </div>
          </div>
        ) : data ? (
          <>
            {/* Score Summary */}
            <div style={{ background: 'white', borderRadius: 8, padding: 20, marginBottom: 16, border: '1px solid #E8E8E4' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {data.teams?.map((team: string, i: number) => {
                  const score = data.score?.[i]
                  const hasScore = score && (score.r > 0 || score.w > 0)
                  return (
                    <div key={team} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 0',
                      borderBottom: i === 0 ? '1px solid #F0F0EC' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                          {team.slice(0, 3).toUpperCase()}
                        </div>
                        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#0D1B2A' }}>{team}</span>
                      </div>
                      {hasScore ? (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 26, fontWeight: 700, color: '#0D1B2A' }}>
                            {score.r}/{score.w}
                          </div>
                          {score.o && (
                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#888' }}>
                              ({score.o} overs)
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#aaa', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>Yet to bat</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Status bar */}
              <div style={{
                marginTop: 14, padding: '10px 14px',
                background: isLive ? '#FFEBEE' : data.matchEnded ? '#E8F5E9' : '#E3F2FD',
                borderRadius: 4, fontSize: 13, fontWeight: 600,
                color: isLive ? '#C62828' : data.matchEnded ? '#1B5E20' : '#1565C0',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {isLive ? '● ' : ''}{data.status || (data.matchEnded ? 'Match Completed' : 'Upcoming')}
              </div>
            </div>

            {/* Innings breakdown (if available) */}
            {data.innings && data.innings.length > 0 && (
              <div style={{ background: 'white', borderRadius: 8, padding: 20, marginBottom: 16, border: '1px solid #E8E8E4' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#0D1B2A', margin: '0 0 14px' }}>
                  Innings Summary
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {data.innings.map((inn: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F8F8F6', borderRadius: 6, border: '1px solid #EFEFEB' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B2A' }}>
                          {inn.team} {inn.isSecond ? '(2nd innings)' : ''}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: '#0D1B2A' }}>
                        {inn.runs}/{inn.wickets}
                        {inn.overs && <span style={{ fontSize: 12, color: '#888', marginLeft: 6 }}>({inn.overs} ov)</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, fontSize: 11, color: '#aaa', fontFamily: 'JetBrains Mono, monospace' }}>
                  Full ball-by-ball scorecard available on LiveScore.com
                </div>
              </div>
            )}

            {/* Match Info */}
            <div style={{ background: 'white', borderRadius: 8, padding: 20, border: '1px solid #E8E8E4' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#0D1B2A', margin: '0 0 14px' }}>
                Match Info
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    { label: 'Match',  value: data.name },
                    { label: 'Series', value: data.series || '—' },
                    { label: 'Venue',  value: data.venue  || '—' },
                    { label: 'Status', value: data.status || '—' },
                  ].filter(r => r.value && r.value !== '—').map(r => (
                    <tr key={r.label} style={{ borderBottom: '1px solid #F0F0EC' }}>
                      <td style={{ padding: '10px 0', fontSize: 12, color: '#888', width: '30%', fontFamily: 'JetBrains Mono, monospace' }}>{r.label}</td>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#0D1B2A', fontWeight: 500 }}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Back link */}
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <Link href="/cricket" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#1B5E20', textDecoration: 'none' }}>
                ← Back to Cricket Portal
              </Link>
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}
