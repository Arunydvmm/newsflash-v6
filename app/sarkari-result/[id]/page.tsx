// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

const TYPE_ICONS: Record<string, string> = {
  'results': '📋',
  'jobs': '💼',
  'admit-card': '🎫',
  'answer-key': '📝',
}

const TYPE_COLORS: Record<string, string> = {
  'results': '#C62828',
  'jobs': '#1B5E20',
  'admit-card': '#1565C0',
  'answer-key': '#6A1B9A',
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#888', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #F0F0EC', fontWeight: 700 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: any }) {
  if (!value || value === 'Check official notification' || value === 'Not specified' || value === '') return null
  return (
    <div style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid #F8F8F6' }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#888', width: 140, flexShrink: 0, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#0D1B2A', fontWeight: 500, flex: 1, lineHeight: 1.6 }}>{value}</span>
    </div>
  )
}

export default function SarkariResultDetailPage({ params }: { params: { id: string } }) {
  const [detail, setDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Get item data from sessionStorage
    const itemData = sessionStorage.getItem(`sarkari-result-${params.id}`)
    if (!itemData) {
      setError('Item data not found')
      setLoading(false)
      return
    }

    const item = JSON.parse(itemData)
    
    // Fetch detailed info from API
    setLoading(true)
    fetch('/api/sarkari/detail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: item.id || params.id,
        title: item.title,
        org: item.org,
        type: item.tab || 'jobs',
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setError(d.error)
          // Still show basic info
          setDetail(item)
        } else {
          setDetail(d.detail)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setError('Failed to load details')
        setDetail(item)
        setLoading(false)
      })
  }, [params.id])

  if (!detail && loading) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh', padding: '40px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#0D1B2A', marginBottom: 8 }}>
            Loading details...
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#888' }}>
            Fetching information from Sarkari Result
          </div>
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh', padding: '40px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Link href="/exam-portal" style={{ color: '#1B5E20', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, marginBottom: 24, display: 'inline-block' }}>
            ← Back to Exam Portal
          </Link>
          <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#0D1B2A', marginBottom: 8 }}>
              Item Not Found
            </div>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
              {error || 'The item you are looking for does not exist.'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const type = detail.type || 'jobs'
  const color = TYPE_COLORS[type] || '#1B5E20'
  const icon = TYPE_ICONS[type] || '📋'

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: `linear-gradient(135deg, ${color}, #0D1B2A)`, color: 'white', padding: '32px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Link href="/exam-portal" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', marginBottom: 16, display: 'inline-block' }}>
            ← Back to Exam Portal
          </Link>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginTop: 16 }}>
            <span style={{ fontSize: 40 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900, marginBottom: 8, lineHeight: 1.3 }}>
                {detail.title}
              </div>
              {detail.organization && (
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {detail.organization}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        {/* Overview */}
        {detail.overview && (
          <div style={{ background: '#F8FFF8', border: `2px solid ${color}`, borderLeft: `4px solid ${color}`, borderRadius: 8, padding: '20px', marginBottom: 32, fontSize: 15, color: '#333', lineHeight: 1.8 }}>
            {detail.overview}
          </div>
        )}

        {/* Key Information */}
        <div style={{ background: 'white', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Section title="📋 Key Information">
            <InfoRow label="Organisation" value={detail.organization} />
            <InfoRow label="Total Vacancies" value={detail.totalVacancy} />
            <InfoRow label="Salary / Pay Scale" value={detail.salary} />
            <InfoRow label="Official Website" value={
              detail.officialWebsite ? (
                <a href={detail.officialWebsite} target="_blank" rel="noopener noreferrer" style={{ color: '#1565C0', textDecoration: 'none', fontWeight: 600 }}>
                  {detail.officialWebsite}
                </a>
              ) : null
            } />
          </Section>
        </div>

        {/* Eligibility */}
        {(detail.eligibility?.education || detail.eligibility?.age || detail.eligibility?.experience) && (
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Section title="🎓 Eligibility">
              <InfoRow label="Education" value={detail.eligibility.education} />
              <InfoRow label="Age Limit" value={detail.eligibility.age} />
              <InfoRow label="Experience" value={detail.eligibility.experience} />
            </Section>
          </div>
        )}

        {/* Important Dates */}
        {Object.values(detail.importantDates || {}).some((v: any) => v && v !== 'Check official notification') && (
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Section title="📅 Important Dates">
              <InfoRow label="Notification" value={detail.importantDates?.notificationDate} />
              <InfoRow label="Apply Start" value={detail.importantDates?.applicationStart} />
              <InfoRow label="Last Date" value={detail.importantDates?.lastDate} />
              <InfoRow label="Exam Date" value={detail.importantDates?.examDate} />
              <InfoRow label="Result Date" value={detail.importantDates?.resultDate} />
            </Section>
          </div>
        )}

        {/* Application Fee */}
        {(detail.applicationFee?.general || detail.applicationFee?.scSt) && (
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Section title="💰 Application Fee">
              <InfoRow label="General / OBC" value={detail.applicationFee.general} />
              <InfoRow label="SC / ST / PH" value={detail.applicationFee.scSt} />
              <InfoRow label="Payment Mode" value={detail.applicationFee.paymentMode} />
            </Section>
          </div>
        )}

        {/* Selection Process */}
        {detail.selectionProcess?.length > 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Section title="🏆 Selection Process">
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                {detail.selectionProcess.map((step: string, i: number) => (
                  <li key={i} style={{ fontSize: 14, color: '#333', padding: '8px 0', lineHeight: 1.6 }}>{step}</li>
                ))}
              </ol>
            </Section>
          </div>
        )}

        {/* How to Apply */}
        {detail.howToApply?.length > 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Section title="📝 How to Apply">
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                {detail.howToApply.map((step: string, i: number) => (
                  <li key={i} style={{ fontSize: 14, color: '#333', padding: '8px 0', lineHeight: 1.6 }}>{step}</li>
                ))}
              </ol>
            </Section>
          </div>
        )}

        {/* Additional Info */}
        {detail.additionalInfo && detail.additionalInfo !== 'Check official notification' && (
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Section title="ℹ Additional Info">
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, margin: 0 }}>{detail.additionalInfo}</p>
            </Section>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
          {detail.officialWebsite && (
            <a href={detail.officialWebsite} target="_blank" rel="noopener noreferrer"
              style={{ background: color, color: 'white', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
              Official Link →
            </a>
          )}
          <Link href="/exam-portal"
            style={{ background: '#F0F0EC', color: '#444', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
            All Jobs
          </Link>
        </div>
      </main>

      {/* Footer with Disclaimer */}
      <footer style={{ background: '#0D1B2A', color: '#4A6080', padding: '32px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Disclaimer Section */}
          <div style={{ background: '#FFF8E1', border: '2px solid #FFE082', borderRadius: 8, padding: '20px', marginBottom: 32 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#E65100', marginBottom: 12, fontWeight: 700 }}>
              ⚠ Disclaimer
            </div>
            <p style={{ fontSize: 13, color: '#E65100', lineHeight: 1.8, margin: 0 }}>
              This information is sourced from publicly available data and aggregated from various government job portals. NewsFlash Media does not guarantee the accuracy, completeness, or timeliness of the information provided. Candidates are strongly advised to verify all details directly from official government websites and notifications before applying. NewsFlash Media is not responsible for any discrepancies or changes made by the recruiting organizations after publication.
            </p>
          </div>

          {/* Footer Info */}
          <div style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
            <div style={{ marginBottom: 12 }}>Powered by Sarkari Result · NewsFlash Media</div>
            <div style={{ fontSize: 10, color: '#2C3E50' }}>© {new Date().getFullYear()} All rights reserved</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
