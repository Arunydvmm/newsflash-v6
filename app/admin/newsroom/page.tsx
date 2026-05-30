'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import AdminShell from '@/components/admin/AdminShell'

export default function NewsroomPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/newsroom/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch newsroom stats:', err)
        setLoading(false)
      })
  }, [])

  const triggerPipeline = async () => {
    if (!confirm('Trigger AI newsroom pipeline? This will fetch RSS feeds and process articles.')) return
    try {
      const res = await fetch('/api/newsroom/trigger', {
        method: 'POST',
        headers: { 'x-cron-secret': process.env.NEXT_PUBLIC_AI_NEWSROOM_CRON_SECRET || 'dev-secret' }
      })
      const data = await res.json()
      alert(`Triggered: ${data.triggered} articles`)
      window.location.reload()
    } catch (err) {
      alert('Failed to trigger pipeline')
    }
  }

  return (
    <AdminShell>
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', fontFamily: 'Playfair Display, serif' }}>
            AI Newsroom
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Automated AI-powered news generation pipeline
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>Loading...</div>
        ) : stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Drafts Ready</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#C62828' }}>{stats.draftsReady}</div>
            </div>
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Blocked</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#C62828' }}>{stats.blocked}</div>
            </div>
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Published Today</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#2E7D32' }}>{stats.publishedToday}</div>
            </div>
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Running</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#1976D2' }}>{stats.running}</div>
            </div>
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Total Published</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#2E7D32' }}>{stats.total}</div>
            </div>
          </div>
        ) : null}

        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Actions</h2>
          <button
            onClick={triggerPipeline}
            style={{
              background: '#C62828',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Trigger Pipeline
          </button>
        </div>

        <div style={{ marginTop: '32px', background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Pipeline Stages</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
            {['MONITORING', 'RESEARCH', 'EXTRACTION', 'FACT_CHECK', 'JUNIOR_DRAFT', 'SENIOR_EDIT', 'BIAS_REVIEW', 'LEGAL_REVIEW', 'COPYRIGHT_REVIEW', 'SEO_REVIEW', 'CHIEF_EDITOR'].map(stage => (
              <div key={stage} style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '4px', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                {stage}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
