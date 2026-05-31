'use client'
import { useState, useEffect } from 'react'
import AdminShell from '@/components/admin/AdminShell'

interface SimpleStatus {
  completedToday: number
  maxArticlesPerDay: number
  engineRunning: boolean
  currentJob: {
    headline: string
    currentStage: string
    elapsedSeconds: number
    currentAgent: string
    modelUsed: string
  } | null
  queue: Array<{
    headline: string
  }>
  tokenQuota: {
    groq: { used: number; limit: number; percent: number }
    google: { used: number; limit: number; percent: number }
    mistral: { used: number; limit: number; percent: number }
  }
  sleepingAgents: Array<{
    agentName: string
    secondsRemaining: number
    reason: string
  }>
  resetDate: string
}

export default function NewsroomPage() {
  const [status, setStatus] = useState<SimpleStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/newsroom/engine/status')
        if (res.ok) {
          const data = await res.json()
          setStatus(data)
        }
      } catch (err) {
        console.error('Failed to fetch engine status:', err)
      }
      setLoading(false)
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const startEngine = async () => {
    try {
      const res = await fetch('/api/newsroom/engine/start', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        alert(data.message || 'Engine started')
      }
    } catch (err) {
      alert('Failed to start engine')
    }
  }

  const stopEngine = async () => {
    if (!confirm('Stop the engine?')) return
    try {
      const res = await fetch('/api/newsroom/engine/stop', { method: 'POST' })
      if (res.ok) {
        alert('Engine stopped')
      }
    } catch (err) {
      alert('Failed to stop engine')
    }
  }

  const resumeEngine = async () => {
    try {
      const res = await fetch('/api/newsroom/engine/resume', { method: 'POST' })
      if (res.ok) {
        alert('Engine resumed')
      }
    } catch (err) {
      alert('Failed to resume engine')
    }
  }

  const triggerNow = async () => {
    if (!confirm('Trigger scheduler now? This will fetch RSS feeds and add articles to queue.')) return
    try {
      const res = await fetch('/api/newsroom/scheduler', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        alert(`${data.added} articles queued. ${data.completedToday}/5 completed today.`)
      } else {
        const error = await res.json()
        alert(`Failed: ${error.error || 'Unknown error'}`)
      }
    } catch (err) {
      alert('Failed to trigger scheduler')
    }
  }

  const wipePipeline = async () => {
    if (!confirm('Wipe all pipeline data? This cannot be undone.')) return
    try {
      const res = await fetch('/api/newsroom/wipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'CONFIRM' })
      })
      if (res.ok) {
        alert('Pipeline data wiped')
      }
    } catch (err) {
      alert('Failed to wipe pipeline')
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <div style={{ padding: '48px', textAlign: 'center', color: '#666' }}>Loading...</div>
      </AdminShell>
    )
  }

  if (!status) {
    return (
      <AdminShell>
        <div style={{ padding: '48px', textAlign: 'center', color: '#666' }}>Failed to load status</div>
      </AdminShell>
    )
  }

  const progressPercent = (status.completedToday / status.maxArticlesPerDay) * 100

  return (
    <AdminShell>
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* TODAY'S PROGRESS */}
        <div style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
            TODAY: {status.completedToday}/{status.maxArticlesPerDay} articles completed
          </div>
          <div style={{ background: '#e0e0e0', borderRadius: '8px', height: '12px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{
              background: '#4CAF50',
              height: '100%',
              width: `${progressPercent}%`,
              transition: 'width 0.3s'
            }} />
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            Resets: midnight IST ({status.resetDate})
          </div>
        </div>

        {/* ENGINE STATUS */}
        <div style={{
          background: status.engineRunning ? '#E8F5E9' : '#FFF3E0',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: `2px solid ${status.engineRunning ? '#4CAF50' : '#FF9800'}`
        }}>
          <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
            ENGINE STATUS
          </div>
          {status.engineRunning && status.currentJob ? (
            <>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                ● RUNNING — "{status.currentJob.headline.substring(0, 50)}..."
              </div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                Current stage: {status.currentJob.currentStage} (4/7)
              </div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                Elapsed: {Math.floor(status.currentJob.elapsedSeconds / 60)}m {status.currentJob.elapsedSeconds % 60}s
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                Agent: {status.currentJob.modelUsed}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '14px' }}>
              {status.engineRunning ? '● RUNNING — No active job' : '■ STOPPED'}
            </div>
          )}
        </div>

        {/* QUEUE */}
        {status.queue.length > 0 && (
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
              QUEUE ({status.queue.length} waiting)
            </div>
            {status.queue.slice(0, 3).map((item, idx) => (
              <div key={idx} style={{ fontSize: '13px', marginBottom: '8px', color: '#666' }}>
                {idx + 1}. "{item.headline.substring(0, 50)}..."
              </div>
            ))}
          </div>
        )}

        {/* API QUOTA */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
            API QUOTA
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', marginBottom: '4px' }}>
              Groq: {status.tokenQuota.groq.used.toLocaleString()} / {status.tokenQuota.groq.limit.toLocaleString()} {status.tokenQuota.groq.percent < 100 ? '✅' : '⚠️'} {status.tokenQuota.groq.percent}%
            </div>
            <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
              <div style={{
                background: status.tokenQuota.groq.percent < 100 ? '#4CAF50' : '#FF9800',
                height: '100%',
                width: `${status.tokenQuota.groq.percent}%`
              }} />
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', marginBottom: '4px' }}>
              Google: {status.tokenQuota.google.used.toLocaleString()} / {status.tokenQuota.google.limit.toLocaleString()} {status.tokenQuota.google.percent < 100 ? '✅' : '⚠️'} {status.tokenQuota.google.percent}%
            </div>
            <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
              <div style={{
                background: status.tokenQuota.google.percent < 100 ? '#4CAF50' : '#FF9800',
                height: '100%',
                width: `${status.tokenQuota.google.percent}%`
              }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '13px', marginBottom: '4px' }}>
              Mistral: {status.tokenQuota.mistral.used.toLocaleString()} / {status.tokenQuota.mistral.limit.toLocaleString()} {status.tokenQuota.mistral.percent < 100 ? '✅' : '⚠️'} {status.tokenQuota.mistral.percent}%
            </div>
            <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
              <div style={{
                background: status.tokenQuota.mistral.percent < 100 ? '#4CAF50' : '#FF9800',
                height: '100%',
                width: `${status.tokenQuota.mistral.percent}%`
              }} />
            </div>
          </div>
        </div>

        {/* SLEEPING AGENTS */}
        {status.sleepingAgents.length > 0 && (
          <div style={{
            background: '#FFF3E0',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '2px solid #FF9800'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
              😴 SLEEPING AGENTS
            </div>
            {status.sleepingAgents.map((agent, idx) => (
              <div key={idx} style={{ fontSize: '13px', marginBottom: '8px' }}>
                {agent.agentName}: {agent.secondsRemaining}s remaining — {agent.reason}
              </div>
            ))}
          </div>
        )}

        {/* CONTROL BUTTONS */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={triggerNow}
            style={{
              background: '#FF9800',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ▶ Trigger Now
          </button>
          <button
            onClick={stopEngine}
            disabled={!status.engineRunning}
            style={{
              background: status.engineRunning ? '#F44336' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: status.engineRunning ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ■ Stop Engine
          </button>
          <button
            onClick={resumeEngine}
            disabled={status.engineRunning}
            style={{
              background: status.engineRunning ? '#ccc' : '#2196F3',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: status.engineRunning ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ↺ Resume
          </button>
          <button
            onClick={wipePipeline}
            style={{
              background: '#C62828',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            🗑 Wipe Data
          </button>
        </div>
      </div>
    </AdminShell>
  )
}
