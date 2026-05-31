'use client'
import { useState, useEffect } from 'react'
import AdminShell from '@/components/admin/AdminShell'

interface EngineStatus {
  engineStopped: boolean
  engineStoppedBy: string | null
  slots: Array<{
    slotNumber: number
    status: string
    currentJob: any
  }>
  queue: {
    queued: number
    running: number
    completed: number
    failed: number
    held: number
  }
  sleepingAgents: Array<{
    jobId: string
    agentName: string
    reason: string
    sleepStarted: number
    wakeAt: number
    secondsRemaining: number
  }>
  keyHealth: Record<string, {
    configured: boolean
    cooling: boolean
    cooldownRemainingSeconds: number
    sharedBy: string[]
  }>
  todayStats: {
    completed: number
    failed: number
    held: number
    avgProcessingTimeSeconds: number
  }
}

export default function NewsroomPage() {
  const [status, setStatus] = useState<EngineStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showJobModal, setShowJobModal] = useState(false)
  const [wipeConfirm, setWipeConfirm] = useState('')

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
        alert(data.message)
      }
    } catch (err) {
      alert('Failed to start engine')
    }
  }

  const stopEngine = async () => {
    if (!confirm('Stop the engine? Running jobs will finish gracefully.')) return
    try {
      const res = await fetch('/api/newsroom/engine/stop', { method: 'POST' })
      if (res.ok) {
        alert('Engine stop requested')
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
        alert(`Added ${data.added} articles, skipped ${data.skipped}`)
      }
    } catch (err) {
      alert('Failed to trigger scheduler')
    }
  }

  const wipePipeline = async () => {
    if (wipeConfirm !== 'CONFIRM') {
      alert('Type CONFIRM to wipe pipeline data')
      return
    }
    try {
      const res = await fetch('/api/newsroom/wipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: wipeConfirm })
      })
      if (res.ok) {
        alert('Pipeline data wiped')
        setWipeConfirm('')
      }
    } catch (err) {
      alert('Failed to wipe pipeline')
    }
  }

  const clearFailedJobs = async () => {
    if (!confirm('Clear all failed jobs?')) return
    try {
      await fetch('/api/newsroom/wipe', { method: 'POST' })
      alert('Failed jobs cleared')
    } catch (err) {
      alert('Failed to clear jobs')
    }
  }

  const resetCooldowns = async () => {
    if (!confirm('Reset all API key cooldowns?')) return
    try {
      const res = await fetch('/api/newsroom/wipe', { method: 'POST' })
      if (res.ok) {
        alert('Key cooldowns reset')
      }
    } catch (err) {
      alert('Failed to reset cooldowns')
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
        <div style={{ padding: '48px', textAlign: 'center', color: '#666' }}>Failed to load engine status</div>
      </AdminShell>
    )
  }

  const stages = ['MONITOR', 'RESEARCH', 'EXTRACT_VERIFY', 'WRITE', 'SAFETY', 'SEO_POLISH', 'CHIEF_EDITOR']
  const getStageIndex = (stageName: string) => stages.indexOf(stageName)
  const getProgress = (stageName: string) => {
    const idx = getStageIndex(stageName)
    return idx >= 0 ? ((idx + 1) / stages.length) * 100 : 0
  }

  return (
    <AdminShell>
      <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* TOP BAR — Engine Control */}
        <div style={{ 
          background: status.engineStopped ? '#FFF3E0' : '#E8F5E9',
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          border: `2px solid ${status.engineStopped ? '#FF9800' : '#4CAF50'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {status.engineStopped ? '■ ENGINE STOPPED' : '● ENGINE RUNNING'}
                {status.engineStopped && status.engineStoppedBy && (
                  <span style={{ fontSize: '14px', fontWeight: '400', color: '#666' }}>
                    (stopped by: {status.engineStoppedBy})
                  </span>
                )}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={startEngine}
                disabled={!status.engineStopped}
                style={{
                  background: !status.engineStopped ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: !status.engineStopped ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                ▶ Start Engine
              </button>
              <button
                onClick={stopEngine}
                disabled={status.engineStopped}
                style={{
                  background: status.engineStopped ? '#ccc' : '#F44336',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: status.engineStopped ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                ■ Stop Engine
              </button>
              <button
                onClick={resumeEngine}
                disabled={!status.engineStopped}
                style={{
                  background: !status.engineStopped ? '#ccc' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: !status.engineStopped ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                ↺ Resume
              </button>
              <button
                onClick={triggerNow}
                style={{
                  background: '#FF9800',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                ⚡ Trigger Now
              </button>
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
            Queue: {status.queue.queued} waiting | {status.queue.running} running | {status.todayStats.completed} done today | {status.queue.failed} failed | {status.queue.held} held
          </div>
        </div>

        {/* SECTION A — 3 Live Slot Cards */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Live Pipeline Slots</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
            {status.slots.map((slot) => (
              <div key={slot.slotNumber} style={{
                background: 'white',
                padding: '16px',
                borderRadius: '8px',
                border: slot.status === 'BUSY' ? '2px solid #2196F3' : '1px solid #e0e0e0',
                boxShadow: slot.status === 'BUSY' ? '0 2px 8px rgba(33, 150, 243, 0.2)' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>
                    SLOT {slot.slotNumber} — {slot.status}
                  </h3>
                  {slot.status === 'BUSY' && (
                    <span style={{ fontSize: '10px', background: '#2196F3', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                      Active
                    </span>
                  )}
                </div>

                {slot.status === 'BUSY' && slot.currentJob ? (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                        📰 "{slot.currentJob.headline.substring(0, 50)}..."
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        Source: {slot.currentJob.source} • Added: {Math.floor((Date.now() - new Date(slot.currentJob.addedAt).getTime()) / 60000)}m ago
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '12px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                        Current: ▶ {slot.currentJob.currentStage} (Stage {getStageIndex(slot.currentJob.currentStage) + 1}/7)
                      </div>
                      <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '8px', overflow: 'hidden', marginBottom: '4px' }}>
                        <div style={{
                          background: '#2196F3',
                          height: '100%',
                          width: `${getProgress(slot.currentJob.currentStage)}%`,
                          transition: 'width 0.3s'
                        }} />
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        Elapsed: {Math.floor(slot.currentJob.elapsedSeconds / 60)}m {slot.currentJob.elapsedSeconds % 60}s
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                      Agent: {slot.currentJob.currentAgent}
                    </div>

                    {slot.currentJob.sleepLog && slot.currentJob.sleepLog.length > 0 && (
                      <div style={{ background: '#FFF3E0', padding: '8px', borderRadius: '4px', fontSize: '11px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>⚠️ Sleep occurred</div>
                        {slot.currentJob.sleepLog.map((log: any, idx: number) => (
                          <div key={idx} style={{ marginBottom: '2px' }}>
                            {log.stage}: {log.sleepDurationMs / 1000}s — {log.reason}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                    Waiting for next queued article
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION B — 7 Agent Status Tiles */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Agent Status</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {[
              { name: 'MONITOR', key: 'GROQ_KEY_1', model: 'llama-3.1-8b-instant' },
              { name: 'RESEARCH', key: 'GROQ_KEY_1', model: 'llama-3.3-70b-versatile' },
              { name: 'EXTRACT_VERIFY', key: 'GOOGLE_AI_KEY_1', model: 'gemini-1.5-flash' },
              { name: 'WRITE', key: 'OPENROUTER_KEY_1', model: 'llama-3.3-70b:free' },
              { name: 'SAFETY', key: 'OPENROUTER_KEY_3', model: 'gemini-2.0-flash-thinking' },
              { name: 'SEO_POLISH', key: 'MISTRAL_KEY_1', model: 'mistral-small-latest' },
              { name: 'CHIEF_EDITOR', key: 'OPENROUTER_KEY_2', model: 'gemini-2.0-flash-thinking' }
            ].map((agent) => {
              const keyHealth = status.keyHealth[agent.key]
              const isSleeping = status.sleepingAgents.some((s: any) => s.agentName === agent.name)
              
              return (
                <div key={agent.name} style={{
                  background: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                    AGENT — {agent.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                    Primary: {agent.key} {keyHealth?.configured ? '✅' : '❌'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                    Model: {agent.model}
                  </div>
                  <div style={{ fontSize: '11px', marginBottom: '8px' }}>
                    Status: {isSleeping ? '😴 Sleeping' : keyHealth?.cooling ? '🟡 Degraded' : keyHealth?.configured ? '🟢 Ready' : '❌ Unconfigured'}
                  </div>
                  {keyHealth?.cooling && (
                    <div style={{ fontSize: '10px', color: '#FF9800' }}>
                      Cooldown: {keyHealth.cooldownRemainingSeconds}s remaining
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* SECTION C — Sleeping Agents Alert */}
        {status.sleepingAgents.length > 0 && (
          <div style={{ 
            background: '#FFF3E0', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            border: '2px solid #FF9800'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>😴 AGENTS IN SLEEP MODE</h2>
            {status.sleepingAgents.map((agent: any, idx: number) => (
              <div key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: idx < status.sleepingAgents.length - 1 ? '1px solid #FFE0B2' : 'none' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  {agent.agentName} — Job: {agent.jobId}
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                  Reason: {agent.reason}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  Sleeping: 45s total • Wakes in: {agent.secondsRemaining}s
                </div>
                <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '6px', overflow: 'hidden', marginTop: '4px' }}>
                  <div style={{
                    background: '#FF9800',
                    height: '100%',
                    width: `${((45 - agent.secondsRemaining) / 45) * 100}%`
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION E — Key Health Dashboard */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Key Health Dashboard</h2>
          <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600' }}>KEY</th>
                  <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600' }}>ASSIGNED TO</th>
                  <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600' }}>STATUS</th>
                  <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600' }}>COOLDOWN</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(status.keyHealth).map(([key, health]) => (
                  <tr key={key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{key}</td>
                    <td style={{ padding: '8px', fontSize: '11px' }}>{health.sharedBy.join(', ')}</td>
                    <td style={{ padding: '8px' }}>
                      {health.configured ? (
                        health.cooling ? (
                          <span style={{ color: '#FF9800', fontWeight: '600' }}>⚠️ Cooling</span>
                        ) : (
                          <span style={{ color: '#4CAF50', fontWeight: '600' }}>✅ Healthy</span>
                        )
                      ) : (
                        <span style={{ color: '#F44336', fontWeight: '600' }}>❌ Unconfigured</span>
                      )}
                    </td>
                    <td style={{ padding: '8px' }}>{health.cooling ? `${health.cooldownRemainingSeconds}s` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION F — Danger Zone */}
        <div style={{ 
          background: '#FFEBEE', 
          padding: '16px', 
          borderRadius: '8px', 
          border: '2px solid #F44336'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#C62828' }}>Danger Zone</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Wipe Pipeline Data</div>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
              Deletes all jobs, queue, watchlist, agent logs, sleep statuses, cooldowns. Published articles are NEVER deleted.
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder='Type "CONFIRM"'
                value={wipeConfirm}
                onChange={(e) => setWipeConfirm(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  fontSize: '12px',
                  minWidth: '150px'
                }}
              />
              <button
                onClick={wipePipeline}
                style={{
                  background: '#C62828',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                Wipe Pipeline Data
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Clear Failed Jobs Only</div>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
              Removes only FAILED status jobs from queue. No confirmation required.
            </div>
            <button
              onClick={clearFailedJobs}
              style={{
                background: '#FF9800',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              Clear Failed Jobs
            </button>
          </div>

          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Reset Key Cooldowns</div>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
              Clears all API key cooldown timers immediately. Use if keys have recovered early.
            </div>
            <button
              onClick={resetCooldowns}
              style={{
                background: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              Reset Key Cooldowns
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
