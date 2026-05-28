// @ts-nocheck
import { connectDB } from '../../lib/db'
import ExamPortal from '../../models/ExamPortal'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Metadata } from 'next'

export const revalidate = 0

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  await connectDB()
  const item = await ExamPortal.findById(params.id).lean()
  
  return {
    title: item?.title || 'Exam Portal',
    description: item?.description || 'View exam notifications, admit cards, answer keys, and results',
  }
}

export default async function ExamPortalDetailPage({ params }: { params: { id: string } }) {
  await connectDB()
  const item = await ExamPortal.findById(params.id).lean()

  if (!item) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh', padding: '40px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0D1B2A', marginBottom: 8 }}>Item Not Found</h1>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>The exam portal item you're looking for doesn't exist.</p>
          <Link href="/sarkari" style={{ display: 'inline-block', background: '#1B5E20', color: 'white', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Sarkari Naukri
          </Link>
        </div>
      </div>
    )
  }

  const TYPE_ICONS: Record<string, string> = {
    'job-notification': '📋',
    'admit-card': '🎫',
    'answer-key': '📝',
    'result': '✅',
    'exam-date': '📅',
  }

  const TYPE_COLORS: Record<string, string> = {
    'job-notification': '#1565C0',
    'admit-card': '#E65100',
    'answer-key': '#6A1B9A',
    'result': '#2E7D32',
    'exam-date': '#C62828',
  }

  const fmt = (d: any) => d ? format(new Date(d), 'd MMM yyyy') : '—'
  const daysLeft = (d: any) => {
    if (!d) return null
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
    return diff
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: '#1B5E20', color: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
          <Link href="/sarkari" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>← Sarkari Naukri</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <span style={{ fontSize: 32 }}>{TYPE_ICONS[item.type]}</span>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono, monospace' }}>{item.type.toUpperCase()}</div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, margin: '4px 0 0' }}>{item.title}</h1>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        {/* Type Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ background: TYPE_COLORS[item.type], color: 'white', padding: '6px 12px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
            {TYPE_ICONS[item.type]} {item.type}
          </span>
          {item.category && <span style={{ background: '#E8E8E4', color: '#666', padding: '6px 12px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{item.category}</span>}
          {item.isFeatured && <span style={{ background: '#FFF8E1', color: '#E65100', padding: '6px 12px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>⭐ Featured</span>}
        </div>

        {/* Main Content Card */}
        <div style={{ background: 'white', borderRadius: 8, padding: 32, marginBottom: 24, border: '1px solid #E8E8E4' }}>
          {/* Organization */}
          {item.organization && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: 4 }}>Organization</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0D1B2A' }}>{item.organization}</div>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: 8 }}>Description</div>
              <div style={{ fontSize: 14, color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{item.description}</div>
            </div>
          )}

          {/* Important Dates */}
          {item.importantDates && Object.keys(item.importantDates).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: 12 }}>Important Dates</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {item.importantDates.registrationStart && (
                  <div style={{ background: '#F8F8F8', padding: 12, borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Registration Start</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A' }}>{fmt(item.importantDates.registrationStart)}</div>
                  </div>
                )}
                {item.importantDates.registrationEnd && (
                  <div style={{ background: '#F8F8F8', padding: 12, borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Registration End</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A' }}>{fmt(item.importantDates.registrationEnd)}</div>
                    {daysLeft(item.importantDates.registrationEnd) !== null && (
                      <div style={{ fontSize: 11, marginTop: 4, color: daysLeft(item.importantDates.registrationEnd) <= 3 ? '#C62828' : '#2E7D32' }}>
                        {daysLeft(item.importantDates.registrationEnd) === 0 ? '⏰ Today' : `⏰ ${daysLeft(item.importantDates.registrationEnd)}d left`}
                      </div>
                    )}
                  </div>
                )}
                {item.importantDates.examDate && (
                  <div style={{ background: '#F8F8F8', padding: 12, borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Exam Date</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A' }}>{fmt(item.importantDates.examDate)}</div>
                  </div>
                )}
                {item.importantDates.admitCardDate && (
                  <div style={{ background: '#F8F8F8', padding: 12, borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Admit Card Date</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A' }}>{fmt(item.importantDates.admitCardDate)}</div>
                  </div>
                )}
                {item.importantDates.answerKeyDate && (
                  <div style={{ background: '#F8F8F8', padding: 12, borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Answer Key Date</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A' }}>{fmt(item.importantDates.answerKeyDate)}</div>
                  </div>
                )}
                {item.importantDates.resultDate && (
                  <div style={{ background: '#F8F8F8', padding: 12, borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Result Date</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A' }}>{fmt(item.importantDates.resultDate)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Links */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {item.applyLink && (
              <a href={item.applyLink} target="_blank" rel="noopener noreferrer" style={{ background: TYPE_COLORS[item.type], color: 'white', padding: '12px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Apply Now →
              </a>
            )}
            {item.notificationPdf && (
              <a href={item.notificationPdf} target="_blank" rel="noopener noreferrer" style={{ background: '#666', color: 'white', padding: '12px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                📄 Notification PDF
              </a>
            )}
            {item.admitCardLink && (
              <a href={item.admitCardLink} target="_blank" rel="noopener noreferrer" style={{ background: '#E65100', color: 'white', padding: '12px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                🎫 Download Admit Card
              </a>
            )}
            {item.answerKeyLink && (
              <a href={item.answerKeyLink} target="_blank" rel="noopener noreferrer" style={{ background: '#6A1B9A', color: 'white', padding: '12px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                📝 View Answer Key
              </a>
            )}
            {item.resultLink && (
              <a href={item.resultLink} target="_blank" rel="noopener noreferrer" style={{ background: '#2E7D32', color: 'white', padding: '12px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                ✅ Check Result
              </a>
            )}
          </div>
        </div>

        {/* Back Button */}
        <Link href="/sarkari" style={{ display: 'inline-block', background: '#1B5E20', color: 'white', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Sarkari Naukri
        </Link>
      </main>

      {/* Footer */}
      <footer style={{ background: '#1B5E20', color: 'rgba(255,255,255,0.6)', marginTop: 48, padding: '20px', textAlign: 'center', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>← Back to NewsFlash</Link>
        <span style={{ margin: '0 12px' }}>·</span>
        © {new Date().getFullYear()} NewsFlash Media
      </footer>
    </div>
  )
}
