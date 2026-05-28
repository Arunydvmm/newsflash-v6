// @ts-nocheck
import { connectDB } from '../lib/db'
import SarkariJob from '../models/SarkariJob'
import ExamPortal from '../models/ExamPortal'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import NewsFeedWidget from '../components/NewsFeedWidget'
import LiveJobsWidget from '../components/LiveJobsWidget'
import SarkariNewsWidget from '../components/SarkariNewsWidget'
import SarkariResultWidget from '../components/SarkariResultWidget'
import AdSlotServer from '../components/AdSlotServer'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Sarkari Naukri 2026 — Jobs, Answer Keys, Admit Cards, Results',
  description: 'Latest Government Jobs, Answer Keys, Admit Cards, Results, Exam Notifications. SSC, UPSC, Railway, Bank, Police jobs 2026.',
  keywords: ['sarkari naukri', 'government jobs', 'answer keys', 'admit cards', 'exam results', 'latest jobs 2026'],
}

export default async function SarkariPage() {
  await connectDB()

  const [latestJobs, examNotifications, admitCards, answerKeys, results] = await Promise.all([
    SarkariJob.find({ isActive: true, isExpired: false }).sort({ createdAt: -1 }).limit(15).lean(),
    ExamPortal.find({ isActive: true, isExpired: false, type: 'job-notification' }).sort({ isFeatured: -1, createdAt: -1 }).limit(10).lean(),
    ExamPortal.find({ isActive: true, isExpired: false, type: 'admit-card' }).sort({ isFeatured: -1, createdAt: -1 }).limit(10).lean(),
    ExamPortal.find({ isActive: true, isExpired: false, type: 'answer-key' }).sort({ isFeatured: -1, createdAt: -1 }).limit(10).lean(),
    ExamPortal.find({ isActive: true, isExpired: false, type: 'result' }).sort({ isFeatured: -1, createdAt: -1 }).limit(10).lean(),
  ])

  const fmt = (d: any) => d ? format(new Date(d), 'd MMM yyyy') : '—'
  const daysLeft = (d: any) => {
    if (!d) return null
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
    return diff
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .item-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); transform: translateY(-1px); }
        .item-card { transition: all 0.2s; }
      `}</style>

      {/* Header */}
      <header style={{ background: '#1B5E20', color: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>← NewsFlash</Link>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 900, marginTop: 8, marginBottom: 4 }}>
            Sarkari <span style={{ color: '#A5D6A7' }}>Naukri</span>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Government Jobs • Answer Keys • Admit Cards • Results</div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        {/* SECTION 1: EXAM NOTIFICATIONS */}
        {examNotifications.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>📋</span>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#0D1B2A', margin: 0 }}>Exam Notifications</h2>
              <span style={{ background: '#1565C0', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginLeft: 'auto' }}>{examNotifications.length} New</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {examNotifications.slice(0, 6).map((item: any) => {
                const dl = daysLeft(item.importantDates?.registrationEnd)
                return (
                  <div key={String(item._id)} className="item-card" style={{ background: 'white', borderRadius: 8, padding: 16, border: '1px solid #E8E8E4', borderLeft: `4px solid #1565C0` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ background: '#1565C0', color: 'white', padding: '4px 8px', borderRadius: 3, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{item.category}</span>
                      {dl !== null && dl >= 0 && <span style={{ background: dl <= 3 ? '#FFEBEE' : '#E8F5E9', color: dl <= 3 ? '#C62828' : '#2E7D32', padding: '2px 8px', borderRadius: 2, fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>{dl === 0 ? 'Today' : `${dl}d`}</span>}
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0D1B2A', marginBottom: 4, lineHeight: 1.3, fontFamily: 'Playfair Display, serif' }}>{item.title}</h3>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{item.organization}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      {item.applyLink && <a href={item.applyLink} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#1565C0', color: 'white', padding: '8px 12px', borderRadius: 4, textDecoration: 'none', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>Apply</a>}
                      {item.notificationPdf && <a href={item.notificationPdf} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#666', color: 'white', padding: '8px 12px', borderRadius: 4, textDecoration: 'none', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>PDF</a>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: LATEST VACANCY */}
        {latestJobs.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>💼</span>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#0D1B2A', margin: 0 }}>Latest Vacancy</h2>
              <span style={{ background: '#E65100', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginLeft: 'auto' }}>{latestJobs.length} Jobs</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {latestJobs.slice(0, 8).map((job: any) => {
                const dl = daysLeft(job.importantDates?.lastDate)
                return (
                  <Link key={String(job._id)} href={`/sarkari/${job.slug}`} className="item-card" style={{ background: 'white', borderRadius: 6, padding: '14px 16px', textDecoration: 'none', border: '1px solid #E8E8E4', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, background: '#E65100', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💼</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0D1B2A', marginBottom: 2, fontFamily: 'Playfair Display, serif' }}>{job.title}</h3>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{job.organization}</div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#666', fontFamily: 'JetBrains Mono, monospace' }}>
                        {job.totalVacancy > 0 && <span>📋 {job.totalVacancy} posts</span>}
                        {job.salaryText && <span>💰 {job.salaryText}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: '#C62828', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4, fontWeight: 600 }}>Last Date</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0D1B2A', fontFamily: 'JetBrains Mono, monospace' }}>{fmt(job.importantDates?.lastDate)}</div>
                      {dl !== null && dl >= 0 && <div style={{ marginTop: 4, background: dl <= 7 ? '#FFEBEE' : '#E8F5E9', color: dl <= 7 ? '#C62828' : '#2E7D32', padding: '2px 6px', borderRadius: 2, fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{dl === 0 ? 'Last Day' : `${dl}d left`}</div>}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>

        {/* SECTION 3: ADMIT CARDS */}
        {admitCards.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>🎫</span>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#0D1B2A', margin: 0 }}>Admit Cards</h2>
              <span style={{ background: '#E65100', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginLeft: 'auto' }}>{admitCards.length} Available</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
              {admitCards.slice(0, 6).map((item: any) => (
                <div key={String(item._id)} className="item-card" style={{ background: 'white', borderRadius: 8, padding: 16, border: '1px solid #E8E8E4', borderTop: '4px solid #E65100' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0D1B2A', marginBottom: 4, fontFamily: 'Playfair Display, serif' }}>{item.title}</h3>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{item.organization}</div>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>📅 {fmt(item.importantDates?.admitCardDate)}</div>
                  {item.admitCardLink && <a href={item.admitCardLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#E65100', color: 'white', padding: '10px 12px', borderRadius: 4, textDecoration: 'none', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>Download Admit Card</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: ANSWER KEYS */}
        {answerKeys.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>📝</span>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#0D1B2A', margin: 0 }}>Answer Keys</h2>
              <span style={{ background: '#6A1B9A', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginLeft: 'auto' }}>{answerKeys.length} Available</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
              {answerKeys.slice(0, 6).map((item: any) => (
                <div key={String(item._id)} className="item-card" style={{ background: 'white', borderRadius: 8, padding: 16, border: '1px solid #E8E8E4', borderTop: '4px solid #6A1B9A' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0D1B2A', marginBottom: 4, fontFamily: 'Playfair Display, serif' }}>{item.title}</h3>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{item.organization}</div>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>📅 {fmt(item.importantDates?.answerKeyDate)}</div>
                  {item.answerKeyLink && <a href={item.answerKeyLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#6A1B9A', color: 'white', padding: '10px 12px', borderRadius: 4, textDecoration: 'none', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>View Answer Key</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: RESULTS */}
        {results.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>✅</span>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#0D1B2A', margin: 0 }}>Results</h2>
              <span style={{ background: '#2E7D32', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginLeft: 'auto' }}>{results.length} Available</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
              {results.slice(0, 6).map((item: any) => (
                <div key={String(item._id)} className="item-card" style={{ background: 'white', borderRadius: 8, padding: 16, border: '1px solid #E8E8E4', borderTop: '4px solid #2E7D32' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0D1B2A', marginBottom: 4, fontFamily: 'Playfair Display, serif' }}>{item.title}</h3>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{item.organization}</div>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>📅 {fmt(item.importantDates?.resultDate)}</div>
                  {item.resultLink && <a href={item.resultLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#2E7D32', color: 'white', padding: '10px 12px', borderRadius: 4, textDecoration: 'none', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>Check Result</a>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Live Jobs + Sarkari Result API + News Feed */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 32px' }}>
        <LiveJobsWidget limit={8} />
        <SarkariNewsWidget />
        <NewsFeedWidget topic="sarkari" limit={10} />
        <NewsFeedWidget topic="education" limit={6} />
        <SarkariResultWidget />
      </div>

      {/* Footer */}
      <footer style={{ background: '#1B5E20', color: 'rgba(255,255,255,0.6)', marginTop: 48, padding: '20px', textAlign: 'center', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>← Back to NewsFlash</Link>
        <span style={{ margin: '0 12px' }}>·</span>
        © {new Date().getFullYear()} NewsFlash Media
      </footer>
    </div>
  )
}
