'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import Link from 'next/link'

const JOB_TYPE_COLORS: Record<string, string> = {
  'Full Time':       '#1B5E20',
  'Full Time Work':  '#1B5E20',
  'Part Time':       '#E65100',
  'Part Time Work':  '#E65100',
  'Contract':        '#1565C0',
  'Internship':      '#6A1B9A',
  'Fresher':         '#00838F',
  'Entry Level':     '#00838F',
  'Remote':          '#283593',
}

function getJobTypeColor(type: string): string {
  if (!type) return '#888'
  const key = Object.keys(JOB_TYPE_COLORS).find(k => type.toLowerCase().includes(k.toLowerCase()))
  return key ? JOB_TYPE_COLORS[key] : '#888'
}

export default function LiveJobsWidget({ limit = 6, location = '', title = '' }: { limit?: number; location?: string; title?: string }) {
  const [jobs, setJobs]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (location) params.set('location', location)
    if (title)    params.set('title', title)

    fetch(`/api/jobs?${params}`)
      .then(r => r.json())
      .then(d => {
        console.log('[LiveJobsWidget] API response:', d)
        setJobs(d.jobs || [])
        if (d.error) setError(d.error)
        setLoading(false)
      })
      .catch(e => {
        console.error('[LiveJobsWidget] fetch error:', e)
        setError('Failed to load jobs')
        setLoading(false)
      })
  }, [limit, location, title])

  // Hide when no jobs to avoid empty widget
  if (!loading && jobs.length === 0) return null

  const shimmer = {
    backgroundImage: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#E65100,#F57C00)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>💼</span>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: 'white' }}>Live Job Listings</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 1, padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>Real-time</span>
        </div>
        <Link href="/sarkari" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textDecoration: 'none' }}>
          All Jobs →
        </Link>
      </div>

      {/* Jobs */}
      {loading ? (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, flexShrink: 0, ...shimmer }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 14, width: '70%', borderRadius: 4, marginBottom: 8, ...shimmer }} />
                <div style={{ height: 11, width: '45%', borderRadius: 4, ...shimmer }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {jobs.map((job: any, i: number) => (
            <div key={job.id || i}
              onMouseEnter={e => (e.currentTarget.style.background = '#FFF3E0')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: '1px solid #F0F0EC', textDecoration: 'none', transition: 'background 0.15s', alignItems: 'flex-start' }}>
              <a href={job.apply_link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', gap: 14, textDecoration: 'none', color: 'inherit', flex: 1, alignItems: 'flex-start' }}>
                {/* Company initial */}
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#E65100,#F57C00)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 900, flexShrink: 0 }}>
                  {(job.company || 'J').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(job.title || job.job_title || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'")}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{job.company}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {job.location && (
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#888', display: 'flex', alignItems: 'center', gap: 3 }}>
                        📍 {job.location}
                      </span>
                    )}
                    {job.experience && (
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#888' }}>
                        🎯 {job.experience}
                      </span>
                  )}
                  {job.job_type && (
                    <span style={{ background: getJobTypeColor(job.job_type) + '20', color: getJobTypeColor(job.job_type), fontFamily: 'JetBrains Mono, monospace', fontSize: 9, padding: '2px 8px', borderRadius: 3, fontWeight: 600 }}>
                      {job.job_type}
                    </span>
                  )}
                </div>
              </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ background: '#E65100', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, padding: '4px 10px', borderRadius: 4, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Apply →
                  </div>
                  {job.posted_date && (
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#aaa', marginTop: 4 }}>
                      {new Date(job.posted_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  )}
                </div>
              </a>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '10px 16px', background: '#FFF3E0', borderTop: '1px solid #FFE0B2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#aaa' }}>
          Live job listings · Updated regularly
        </span>
        <Link href="/sarkari" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#E65100', textDecoration: 'none', fontWeight: 600 }}>
          View All Jobs →
        </Link>
      </div>
    </div>
  )
}
