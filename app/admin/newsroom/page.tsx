'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import AdminShell from '@/components/admin/AdminShell'

export default function NewsroomPage() {
  const [stats, setStats] = useState(null)
  const [agentStats, setAgentStats] = useState(null)
  const [watchlist, setWatchlist] = useState(null)
  const [monitoringData, setMonitoringData] = useState(null)
  const [emergencyStop, setEmergencyStop] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAgentReport, setShowAgentReport] = useState(false)
  const [showWatchlist, setShowWatchlist] = useState(false)
  const [showMonitoring, setShowMonitoring] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [customUrl, setCustomUrl] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusData, agentsData, watchlistData, monitoringResponse, emergencyResponse] = await Promise.all([
          fetch('/api/newsroom/status').then(res => res.json()),
          fetch('/api/newsroom/agents').then(res => res.json()),
          fetch('/api/newsroom/queue/process').then(res => res.json()),
          fetch('/api/newsroom/monitoring').then(res => res.json()),
          fetch('/api/newsroom/emergency-stop').then(res => res.json())
        ])
        setStats(statusData)
        setAgentStats(agentsData)
        setWatchlist(watchlistData.watchlist || [])
        setMonitoringData(monitoringResponse)
        setEmergencyStop(emergencyResponse.emergencyStop || false)
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

  const fetchFromUrl = async () => {
    if (!customUrl.trim()) {
      alert('Please enter a URL')
      return
    }
    
    if (!confirm(`Fetch article from URL: ${customUrl}?`)) return
    
    setProcessing(true)
    try {
      const res = await fetch('/api/newsroom/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: customUrl })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        alert(`Failed: ${errorData.error || 'Unknown error'}`)
        setProcessing(false)
        return
      }
      
      const data = await res.json()
      alert(`Added article to watchlist: ${data.headline}`)
      setCustomUrl('')
      window.location.reload()
    } catch (err) {
      alert('Failed to fetch from URL')
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
    const action = emergencyStop ? 'deactivate' : 'activate'
    const confirmMessage = emergencyStop 
      ? 'Deactivate emergency kill switch? Pipeline will resume processing.' 
      : 'EMERGENCY KILL SWITCH: This will stop all pipeline jobs. Are you sure?'
    
    if (!confirm(confirmMessage)) return
    try {
      const res = await fetch('/api/newsroom/emergency-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      const data = await res.json()
      if (data.success) {
        setEmergencyStop(data.emergencyStop)
        alert(emergencyStop ? 'Emergency kill switch deactivated' : 'Emergency kill switch activated')
      } else {
        alert(data.error || 'Failed to toggle kill switch')
      }
    } catch (err) {
      alert('Failed to toggle kill switch')
    }
  }


  return (
    <AdminShell>
      <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', fontFamily: 'Playfair Display, serif' }}>
            AI Newsroom
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Automated AI-powered news generation pipeline
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>Loading...</div>
        ) : stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>Drafts Ready</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#C62828' }}>{stats.draftsReady}</div>
            </div>
            <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>Blocked</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#C62828' }}>{stats.blocked}</div>
            </div>
            <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>Published Today</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#2E7D32' }}>{stats.publishedToday}</div>
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

        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Actions</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <button
              onClick={triggerPipeline}
              style={{
                background: '#C62828',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                flex: '1 1 auto',
                minWidth: '120px'
              }}
            >
              Trigger Pipeline
            </button>
            <button
              onClick={() => setShowAgentReport(!showAgentReport)}
              style={{
                background: '#1976D2',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                flex: '1 1 auto',
                minWidth: '120px'
              }}
            >
              📊 Agent Report
            </button>
            <button
              onClick={() => setShowWatchlist(!showWatchlist)}
              style={{
                background: '#7B1FA2',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                flex: '1 1 auto',
                minWidth: '120px'
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
                padding: '10px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                flex: '1 1 auto',
                minWidth: '120px'
              }}
            >
              🔴 Live Monitor
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Paste article URL to fetch..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '10px 12px',
                borderRadius: '4px',
                border: '1px solid #e0e0e0',
                fontSize: '12px'
              }}
            />
            <button
              onClick={fetchFromUrl}
              disabled={processing}
              style={{
                background: '#2E7D32',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                minWidth: '100px'
              }}
            >
              {processing ? 'Fetching...' : 'Fetch URL'}
            </button>
          </div>
        </div>

        {showAgentReport && agentStats && (
          <div style={{ marginTop: '24px', background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Agent Report Cards</h2>
            
            {agentStats.overview && (
              <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Pipeline Overview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Total Articles</div>
                    <div style={{ fontSize: '18px', fontWeight: '700' }}>{agentStats.overview.totalArticles}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Published</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#2E7D32' }}>{agentStats.overview.publishedArticles}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Draft Ready</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1976D2' }}>{agentStats.overview.draftReadyArticles}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Blocked</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#C62828' }}>{agentStats.overview.blockedArticles}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Success Rate</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#2E7D32' }}>{agentStats.overview.successRate}%</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              {agentStats.agentStats.map((agent: any) => (
                <div key={agent.stage} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>{agent.stage}</h3>
                    <span style={{ fontSize: '11px', background: '#1976D2', color: 'white', padding: '3px 6px', borderRadius: '4px' }}>
                      {agent.totalRuns} runs
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
                    <div>
                      <div style={{ color: '#666' }}>Avg Confidence</div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{(agent.avgConfidence * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div style={{ color: '#666' }}>Avg Tokens</div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{agent.avgTokens.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: '#666' }}>Avg Time</div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{(agent.avgProcessingTime / 1000).toFixed(2)}s</div>
                    </div>
                    <div>
                      <div style={{ color: '#666' }}>Total Tokens</div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{agent.totalTokens.toLocaleString()}</div>
                    </div>
                  </div>

                  {agent.recentLogs && agent.recentLogs.length > 0 && (
                    <div style={{ marginTop: '8px', borderTop: '1px solid #e0e0e0', paddingTop: '8px' }}>
                      <div style={{ fontSize: '10px', color: '#666', marginBottom: '6px' }}>Recent Activity</div>
                      {agent.recentLogs.slice(0, 3).map((log: any, idx: number) => (
                        <div key={idx} style={{ fontSize: '10px', padding: '3px 0', borderBottom: idx < 2 ? '1px solid #f0f0f0' : 'none' }}>
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
          <div style={{ marginTop: '24px', background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Watchlist Queue</h2>
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
              <div style={{ textAlign: 'center', padding: '24px', color: '#666', fontSize: '12px' }}>No items in watchlist</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {watchlist.map((item: any) => (
                  <div key={item.id} style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                      <div style={{ flex: 1, marginRight: '8px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '3px' }}>{item.headline}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          {item.sourceName} • {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '10px',
                        padding: '3px 6px',
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
                      <div style={{ fontSize: '10px', color: '#C62828', marginTop: '6px' }}>
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
          <div style={{ marginTop: '24px', background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>🔴 Live Pipeline Monitor</h2>
              <div style={{ fontSize: '11px', color: '#666' }}>Auto-refreshing every 5s</div>
            </div>

            {/* Watchlist Status */}
            <div style={{ marginBottom: '16px', padding: '12px', background: '#FFF3E0', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Watchlist Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Pending</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#FF9800' }}>{monitoringData.watchlistStatus.pending}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Processing</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#2196F3' }}>{monitoringData.watchlistStatus.processing}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Completed</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#4CAF50' }}>{monitoringData.watchlistStatus.completed}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Failed</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#F44336' }}>{monitoringData.watchlistStatus.failed}</div>
                </div>
              </div>
            </div>

            {/* Currently Processing */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Currently Processing</h3>
              {monitoringData.processingArticles.length === 0 ? (
                <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px', color: '#666', fontSize: '11px' }}>
                  No articles currently processing
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {monitoringData.processingArticles.map((article: any) => {
                    const stages = ['MONITORING', 'RESEARCH', 'EXTRACTION', 'FACT_CHECK', 'JUNIOR_DRAFT', 'SENIOR_EDIT', 'BIAS_REVIEW', 'LEGAL_REVIEW', 'COPYRIGHT_REVIEW', 'SEO_REVIEW', 'CHIEF_EDITOR']
                    const currentStageIndex = stages.indexOf(article.currentStage?.toUpperCase())
                    
                    return (
                      <div key={article.id} style={{ border: '1px solid #2196F3', borderRadius: '4px', padding: '10px', background: '#E3F2FD' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '3px' }}>{article.title}</div>
                            <div style={{ fontSize: '11px', color: '#666' }}>
                              {article.sourceName} • {new Date(article.updatedAt).toLocaleString()}
                            </div>
                          </div>
                          <span style={{
                            fontSize: '10px',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            fontWeight: '600',
                            background: '#2196F3',
                            color: 'white'
                          }}>
                            {article.currentStage}
                          </span>
                        </div>
                        
                        {/* Horizontal Progress Bar */}
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', gap: '1px', marginBottom: '3px' }}>
                            {stages.map((stage, index) => {
                              const isCompleted = index < currentStageIndex
                              const isCurrent = index === currentStageIndex
                              const isPending = index > currentStageIndex
                              
                              return (
                                <div
                                  key={stage}
                                  style={{
                                    flex: 1,
                                    height: '6px',
                                    borderRadius: '1px',
                                    background: isCompleted ? '#4CAF50' : isCurrent ? '#2196F3' : '#E0E0E0',
                                    transition: 'background 0.3s'
                                  }}
                                  title={stage}
                                />
                              )
                            })}
                          </div>
                          <div style={{ fontSize: '9px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                            <span>MONITORING</span>
                            <span>CHIEF_EDITOR</span>
                          </div>
                        </div>
                        
                        <div style={{ fontSize: '10px', color: '#1976D2', marginBottom: '6px' }}>
                          Status: {article.pipelineStatus} • Stage {currentStageIndex + 1}/11
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter reason for stopping:')
                              if (reason) controlArticle(article.id, 'stop', reason)
                            }}
                            style={{
                              background: '#F44336',
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '10px',
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
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '10px',
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
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}
                          >
                            ✏ Edit
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Blocked Articles */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Blocked Articles</h3>
              {monitoringData.blockedArticles.length === 0 ? (
                <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px', color: '#666', fontSize: '11px' }}>
                  No blocked articles
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {monitoringData.blockedArticles.map((article: any) => (
                    <div key={article.id} style={{ border: '1px solid #F44336', borderRadius: '4px', padding: '10px', background: '#FFEBEE' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '3px' }}>{article.title}</div>
                      <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>
                        {article.sourceName} • {new Date(article.updatedAt).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '10px', color: '#C62828', marginBottom: '6px' }}>
                        Reason: {article.blockReason}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter reason for unblocking:')
                            if (reason) controlArticle(article.id, 'unblock', reason)
                          }}
                          style={{
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}
                        >
                          ✅ Unblock
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
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Recent Activity</h3>
              {monitoringData.recentActivity.length === 0 ? (
                <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px', color: '#666', fontSize: '11px' }}>
                  No recent activity
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {monitoringData.recentActivity.map((log: any) => (
                    <div key={log.id} style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '3px' }}>{log.article.title}</div>
                          <div style={{ fontSize: '10px', color: '#666' }}>
                            Stage: {log.stageName} • {new Date(log.startTime).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '10px', color: '#666' }}>
                            Confidence: {(log.confidence * 100).toFixed(0)}%
                          </div>
                          <span style={{
                            fontSize: '9px',
                            padding: '2px 5px',
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
                        <div style={{ fontSize: '10px', color: '#666' }}>
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
