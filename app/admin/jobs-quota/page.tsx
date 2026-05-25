'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import AdminShell from '../../components/admin/AdminShell'

export default function JobsQuotaPage() {
  const [status, setStatus]   = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [msg, setMsg]         = useState('')

  async function loadStatus() {
    setLoading(true)
    const res = await fetch('/api/jobs/refresh', { credentials: 'include' })
    const d   = await res.json()
    setStatus(d)
    setLoading(false)
  }

  async function forceRefresh() {
    if (!confirm(`This will use 1 of your 10 monthly API hits. ${status?.hitsRemaining} remaining. Continue?`)) return
    setRefreshing(true)
    setMsg('')
    const res = await fetch('/api/jobs/refresh', { method: 'POST', credentials: 'include' })
    const d   = await res.json()
    if (d.success) {
      setMsg(`✅ Refreshed! ${d.jobsLoaded} jobs loaded. ${d.hitsRemaining} hits remaining this month.`)
    } else {
      setMsg(`❌ ${d.error}`)
    }
    setRefreshing(false)
    loadStatus()
  }

  useEffect(() => { loadStatus() }, [])

  const pct = status ? Math.round((status.hitsUsed / 10) * 100) : 0

  return (
    <AdminShell>
      <div style={{ padding: 28, maxWidth: 600 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#0D1B2A', margin: 0 }}>Jobs API Quota</h1>
          <p style={{ color: '#888', fontSize: 12, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>IndianAPI.in — 10 hits/month free tier</p>
        </div>

        {msg && (
          <div style={{ background: msg.startsWith('✅') ? '#E8F5E9' : '#FFEBEE', color: msg.startsWith('✅') ? '#1B5E20' : '#C62828', padding: '12px 16px', borderRadius: 6, marginBottom: 20, fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>
            {msg}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>Loading...</div>
        ) : (
          <>
            {/* Quota Bar */}
            <div style={{ background: 'white', borderRadius: 10, padding: 24, border: '1px solid #E8E8E4', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#444' }}>Monthly API Hits</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: pct >= 80 ? '#C62828' : '#1B5E20' }}>
                  {status?.hitsUsed} / 10 used
                </span>
              </div>
              <div style={{ height: 12, background: '#F0F0EC', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct >= 80 ? '#C62828' : pct >= 50 ? '#E65100' : '#1B5E20', borderRadius: 6, transition: 'width 0.5s' }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: '#aaa', fontFamily: 'JetBrains Mono, monospace' }}>
                {status?.hitsRemaining} hits remaining this month
              </div>
            </div>

            {/* Cache Status */}
            <div style={{ background: 'white', borderRadius: 10, padding: 24, border: '1px solid #E8E8E4', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A', marginBottom: 14 }}>Cache Status</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    { label: 'Jobs in Cache',    value: status?.jobsInCache || 0 },
                    { label: 'Last Fetched',     value: status?.lastFetched ? new Date(status.lastFetched).toLocaleString('en-IN') : 'Never' },
                    { label: 'Cache Expires',    value: status?.cacheExpiresAt ? new Date(status.cacheExpiresAt).toLocaleString('en-IN') : '—' },
                    { label: 'Cache Status',     value: status?.cacheFresh ? '✅ Fresh (serving from cache)' : '⚠️ Stale or empty' },
                    { label: 'Cache Duration',   value: '72 hours (3 days)' },
                  ].map(r => (
                    <tr key={r.label} style={{ borderBottom: '1px solid #F0F0EC' }}>
                      <td style={{ padding: '10px 0', fontSize: 12, color: '#888', fontFamily: 'JetBrains Mono, monospace', width: '45%' }}>{r.label}</td>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#0D1B2A', fontWeight: 500 }}>{String(r.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Strategy */}
            <div style={{ background: '#E8F5E9', borderRadius: 10, padding: 20, border: '1px solid #C5E1A5', marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1B5E20', marginBottom: 10 }}>💡 Quota Strategy</h3>
              <div style={{ fontSize: 12, color: '#2E7D32', lineHeight: 1.8, fontFamily: 'JetBrains Mono, monospace' }}>
                • Cache duration: 72 hours (3 days)<br/>
                • Max hits needed: ~10/month ✅<br/>
                • All visitors served from MongoDB cache<br/>
                • 0 API hits until cache expires<br/>
                • Manual refresh available below
              </div>
            </div>

            {/* Manual Refresh */}
            <button onClick={forceRefresh} disabled={refreshing || status?.hitsRemaining === 0}
              style={{ background: status?.hitsRemaining === 0 ? '#aaa' : '#E65100', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 6, cursor: status?.hitsRemaining === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: refreshing ? 0.7 : 1 }}>
              {refreshing ? 'Refreshing...' : status?.hitsRemaining === 0 ? 'Quota Exhausted' : `Force Refresh (uses 1 hit — ${status?.hitsRemaining} left)`}
            </button>
          </>
        )}
      </div>
    </AdminShell>
  )
}
