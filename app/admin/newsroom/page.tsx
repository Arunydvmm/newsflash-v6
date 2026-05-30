'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import AdminShell from '@/components/admin/AdminShell'

export default function NewsroomPage() {
  const [stats, setStats] = useState(null)
  const [agentStats, setAgentStats] = useState(null)
  const [watchlist, setWatchlist] = useState(null)
  const [monitoringData, setMonitoringData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAgentReport, setShowAgentReport] = useState(false)
  const [showWatchlist, setShowWatchlist] = useState(false)
  const [showMonitoring, setShowMonitoring] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusData, agentsData, watchlistData, monitoringResponse] = await Promise.all([
          fetch('/api/newsroom/status').then(res => res.json()),
          fetch('/api/newsroom/agents').then(res => res.json()),
          fetch('/api/newsroom/queue/process').then(res => res.json()),
          fetch('/api/newsroom/monitoring').then(res => res.json())
        ])
        setStats(statusData)
        setAgentStats(agentsData)
        setWatchlist(watchlistData.watchlist || [])
        setMonitoringData(monitoringResponse)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch newsroom stats:', err)
        setLoading(false)
      }
    }

    fetchData()

    // Auto-refresh monitoring data every 5 seconds if monitoring view is open
    let interval: NodeJS.Timeout
    if (showMonitoring) {
      interval = setInterval(fetchData, 5000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [showMonitoring])

  const triggerPipeline = async () => {
    if (!confirm('Trigger AI newsroom pipeline? This will fetch RSS feeds and add articles to watchlist.')) return
    try {
      const res = await fetch('/api/newsroom/pipeline', {
        method: 'POST'
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        alert(`Failed: ${errorData.error || 'Unknown error'}`)
        return
      }
      
      const data = await res.json()
      alert(`Added ${data.added || 0} articles to watchlist`)
      window.location.reload()
    } catch (err) {
      alert('Failed to trigger pipeline')
      console.error(err)
    }
  }

  const processNextItem = async () => {
    if (!confirm('Process next item from watchlist?')) return
    setProcessing(true)
    try {
      const res = await fetch('/api/newsroom/queue/process', {
        method: 'POST'
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        if (res.status === 429) {
          alert(`Rate limit: ${errorData.message}`)
        } else {
          alert(`Failed: ${errorData.error || 'Unknown error'}`)
        }
        setProcessing(false)
        return
      }
      
      const data = await res.json()
      alert(`Processed: ${data.article}`)
      window.location.reload()
    } catch (err) {
      alert('Failed to process item')
      console.error(err)
      setProcessing(false)
    }
  }

  const controlArticle = async (articleId: string, action: string, reason?: string) => {
    try {
      const res = await fetch(`/api/newsroom/articles/${articleId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        alert(`Failed: ${errorData.error || 'Unknown error'}`)
        return
      }
      
      alert('Action completed successfully')
      window.location.reload()
    } catch (err) {
      alert('Failed to control article')
      console.error(err)
    }
  }

  const toggleEmergencyStop = async () => {
    if (!confirm('EMERGENCY KILL SWITCH: This will stop all pipeline jobs. Are you sure?')) return
    try {
      const res = await fetch('/api/newsroom/emergency-stop', {
        method: 'POST'
      })
      const data = await res.json()
      if (data.success) {
        alert('Emergency kill switch activated')
        window.location.reload()
      } else {
        alert(data.error || 'Failed to activate kill switch')
      }
    } catch (err) {
      alert('Failed to activate kill switch')
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
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#1976D2' }}>{stats.pipelineRunning}</div>
            </div>
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Total Published</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#2E7D32' }}>{stats.total}</div>
            </div>
          </div>
        ) : null}

        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Actions</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
              Trigger Pipeline (RSS)
            </button>
            <button
              onClick={() => setShowAgentReport(!showAgentReport)}
              style={{
                background: '#1976D2',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              📊 Agent Report Cards
            </button>
            <button
              onClick={() => setShowWatchlist(!showWatchlist)}
              style={{
                background: '#7B1FA2',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              📋 Watchlist ({watchlist?.filter((w: any) => w.status === 'PENDING').length || 0})
            </button>
            <button
              onClick={() => setShowMonitoring(!showMonitoring)}
              style={{
                background: '#E65100',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              🔴 Live Monitor
            </button>
            <button
              onClick={toggleEmergencyStop}
              style={{
                background: '#000000',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              🚨 EMERGENCY KILL SWITCH
            </button>
          </div>
        </div>

        {showAgentReport && agentStats && (
          <div style={{ marginTop: '32px', background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Agent Report Cards</h2>
            
            {agentStats.overview && (
              <div style={{ marginBottom: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Pipeline Overview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total Articles</div>
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>{agentStats.overview.totalArticles}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Published</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#2E7D32' }}>{agentStats.overview.publishedArticles}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Draft Ready</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1976D2' }}>{agentStats.overview.draftReadyArticles}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Blocked</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#C62828' }}>{agentStats.overview.blockedArticles}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Success Rate</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#2E7D32' }}>{agentStats.overview.successRate}%</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {agentStats.agentStats.map((agent: any) => (
                <div key={agent.stage} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>{agent.stage}</h3>
                    <span style={{ fontSize: '12px', background: '#1976D2', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>
                      {agent.totalRuns} runs
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                    <div>
                      <div style={{ color: '#666' }}>Avg Confidence</div>
                      <div style={{ fontSize: '16px', fontWeight: '600' }}>{(agent.avgConfidence * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div style={{ color: '#666' }}>Avg Tokens</div>
                      <div style={{ fontSize: '16px', fontWeight: '600' }}>{agent.avgTokens.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: '#666' }}>Avg Time</div>
                      <div style={{ fontSize: '16px', fontWeight: '600' }}>{(agent.avgProcessingTime / 1000).toFixed(2)}s</div>
                    </div>
                    <div>
                      <div style={{ color: '#666' }}>Total Tokens</div>
                      <div style={{ fontSize: '16px', fontWeight: '600' }}>{agent.totalTokens.toLocaleString()}</div>
                    </div>
                  </div>

                  {agent.recentLogs && agent.recentLogs.length > 0 && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid #e0e0e0', paddingTop: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Recent Activity</div>
                      {agent.recentLogs.slice(0, 3).map((log: any, idx: number) => (
                        <div key={idx} style={{ fontSize: '11px', padding: '4px 0', borderBottom: idx < 2 ? '1px solid #f0f0f0' : 'none' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666' }}>{log.stageStatus}</span>
                            <span>{(log.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showWatchlist && watchlist && (
          <div style={{ marginTop: '32px', background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Watchlist Queue</h2>
              <button
                onClick={processNextItem}
                disabled={processing}
                style={{
                  background: processing ? '#999' : '#7B1FA2',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                {processing ? 'Processing...' : 'Process Next Item'}
              </button>
            </div>

            {watchlist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#666' }}>No items in watchlist</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {watchlist.map((item: any) => (
                  <div key={item.id} style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div style={{ flex: 1, marginRight: '12px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{item.headline}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {item.sourceName} • {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '600',
                        background: item.status === 'PENDING' ? '#FF9800' : 
                                  item.status === 'PROCESSING' ? '#2196F3' : 
                                  item.status === 'COMPLETED' ? '#4CAF50' : '#F44336',
                        color: 'white'
                      }}>
                        {item.status}
                      </span>
                    </div>
                    {item.errorMessage && (
                      <div style={{ fontSize: '11px', color: '#C62828', marginTop: '8px' }}>
                        Error: {item.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showMonitoring && monitoringData && (
          <div style={{ marginTop: '32px', background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>🔴 Live Pipeline Monitor</h2>
              <div style={{ fontSize: '12px', color: '#666' }}>Auto-refreshing every 5s</div>
            </div>

            {/* Watchlist Status */}
            <div style={{ marginBottom: '24px', padding: '16px', background: '#FFF3E0', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Watchlist Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Pending</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#FF9800' }}>{monitoringData.watchlistStatus.pending}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Processing</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#2196F3' }}>{monitoringData.watchlistStatus.processing}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Completed</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#4CAF50' }}>{monitoringData.watchlistStatus.completed}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Failed</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#F44336' }}>{monitoringData.watchlistStatus.failed}</div>
                </div>
              </div>
            </div>

            {/* Currently Processing */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Currently Processing</h3>
              {monitoringData.processingArticles.length === 0 ? (
                <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '4px', color: '#666', fontSize: '12px' }}>
                  No articles currently processing
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {monitoringData.processingArticles.map((article: any) => (
                    <div key={article.id} style={{ border: '1px solid #2196F3', borderRadius: '4px', padding: '12px', background: '#E3F2FD' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{article.title}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {article.sourceName} • {new Date(article.updatedAt).toLocaleString()}
                          </div>
                        </div>
                        <span style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: '600',
                          background: '#2196F3',
                          color: 'white'
                        }}>
                          {article.currentStage}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#1976D2', marginBottom: '8px' }}>
                        Status: {article.pipelineStatus}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter reason for stopping:')
                            if (reason) controlArticle(article.id, 'stop', reason)
                          }}
                          style={{
                            background: '#F44336',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}
                        >
                          ⏹ Stop
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this article? This cannot be undone.')) {
                              controlArticle(article.id, 'delete')
                            }
                          }}
                          style={{
                            background: '#9E9E9E',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}
                        >
                          🗑 Delete
                        </button>
                        <button
                          onClick={() => {
                            const suggestion = prompt('Enter edit suggestion for the agent:')
                            if (suggestion) controlArticle(article.id, 'suggest_edit', suggestion)
                          }}
                          style={{
                            background: '#FF9800',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}
                        >
                          ✏ Suggest Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Blocked Articles */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Blocked Articles</h3>
              {monitoringData.blockedArticles.length === 0 ? (
                <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '4px', color: '#666', fontSize: '12px' }}>
                  No blocked articles
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {monitoringData.blockedArticles.map((article: any) => (
                    <div key={article.id} style={{ border: '1px solid #F44336', borderRadius: '4px', padding: '12px', background: '#FFEBEE' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{article.title}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                        {article.sourceName} • {new Date(article.updatedAt).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#C62828' }}>
                        Reason: {article.blockReason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Recent Activity</h3>
              {monitoringData.recentActivity.length === 0 ? (
                <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '4px', color: '#666', fontSize: '12px' }}>
                  No recent activity
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {monitoringData.recentActivity.map((log: any) => (
                    <div key={log.id} style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{log.article.title}</div>
                          <div style={{ fontSize: '11px', color: '#666' }}>
                            Stage: {log.stageName} • {new Date(log.startTime).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>
                            Confidence: {(log.confidence * 100).toFixed(0)}%
                          </div>
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: '600',
                            background: log.stageStatus === 'COMPLETED' ? '#4CAF50' : '#FF9800',
                            color: 'white'
                          }}>
                            {log.stageStatus}
                          </span>
                        </div>
                      </div>
                      {log.recommendation && (
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          Recommendation: {log.recommendation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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
