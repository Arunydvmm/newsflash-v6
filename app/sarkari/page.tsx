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

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Sarkari Naukri 2026 — Jobs, Answer Keys, Admit Cards, Results',
  description: 'Latest Government Jobs, Answer Keys, Admit Cards, Results, Exam Notifications. SSC, UPSC, Railway, Bank, Police jobs 2026.',
  keywords: ['sarkari naukri', 'government jobs', 'answer keys', 'admit cards', 'exam results', 'latest jobs 2026'],
}

export default async function SarkariPage() {
  await connectDB()

  const [latestJobs, examNotifications, admitCards, answerKeys, results] = await Promise.all([
    SarkariJob.find({ isActive: true, isExpired: false }).sort({ createdAt: -1 }).limit(50).lean(),
    ExamPortal.find({ isActive: true, isExpired: false, type: 'job-notification' }).sort({ isFeatured: -1, createdAt: -1 }).limit(50).lean(),
    ExamPortal.find({ isActive: true, isExpired: false, type: 'admit-card' }).sort({ isFeatured: -1, createdAt: -1 }).limit(50).lean(),
    ExamPortal.find({ isActive: true, isExpired: false, type: 'answer-key' }).sort({ isFeatured: -1, createdAt: -1 }).limit(50).lean(),
    ExamPortal.find({ isActive: true, isExpired: false, type: 'result' }).sort({ isFeatured: -1, createdAt: -1 }).limit(50).lean(),
  ])

  const fmt = (d: any) => d ? format(new Date(d), 'd MMM yyyy') : '—'
  const daysLeft = (d: any) => {
    if (!d) return null
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
    return diff
  }

  const TableSection = ({ icon, title, color, items, type }: any) => (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: '#0D1B2A', margin: 0 }}>
          {title}
        </h2>
        <span style={{ background: color, color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginLeft: 'auto' }}>
          {items.length} Items
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 8, padding: 40, textAlign: 'center', border: '1px solid #E8E8E4' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 14, color: '#666' }}>No items available</div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 8, overflow: 'auto', border: '1px solid #E8E8E4' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#F8F8F8', borderBottom: '2px solid #E8E8E4' }}>
                {type === 'vacancy' ? (
                  <>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#0D1B2A', whiteSpace: 'nowrap' }}>Job Title</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#0D1B2A', whiteSpace: 'nowrap' }}>Organization</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#0D1B2A', whiteSpace: 'nowrap' }}>Posts</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#0D1B2A', whiteSpace: 'nowrap' }}>Salary</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#0D1B2A', whiteSpace: 'nowrap' }}>Last Date</th>
                  </>
                ) : (
                  <>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#0D1B2A', whiteSpace: 'nowrap' }}>Title</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#0D1B2A', whiteSpace: 'nowrap' }}>Organization</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#0D1B2A', whiteSpace: 'nowrap' }}>Category</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#0D1B2A', whiteSpace: 'nowrap' }}>Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => {
                const dl = daysLeft(item.importantDates?.lastDate || item.importantDates?.registrationEnd || item.importantDates?.admitCardDate || item.importantDates?.answerKeyDate || item.importantDates?.resultDate)
                return (
                  <tr key={String(item._id)} style={{ borderBottom: '1px solid #E8E8E4', transition: 'background 0.2s', background: idx % 2 === 0 ? 'white' : '#FAFAFA' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F0F0F0'} onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#FAFAFA'}>
                    <td style={{ padding: '14px 16px', fontSize: 13, minWidth: '200px' }}>
                      <Link href={`/exam-portal/${item._id}`} style={{ color: '#1565C0', textDecoration: 'none', fontWeight: 600, cursor: 'pointer' }}>
                        {item.title}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#666', minWidth: '150px' }}>{item.organization}</td>
                    {type === 'vacancy' ? (
                      <>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#666', textAlign: 'center', minWidth: '80px' }}>{item.totalVacancy || '—'}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#666', minWidth: '120px' }}>{item.salaryText || '—'}</td>
                      </>
                    ) : (
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#666', minWidth: '100px' }}>{item.category || '—'}</td>
                    )}
                    <td style={{ padding: '14px 16px', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', textAlign: 'center', minWidth: '120px' }}>
                      <div style={{ fontWeight: 600, color: '#0D1B2A' }}>{fmt(item.importantDates?.lastDate || item.importantDates?.registrationEnd || item.importantDates?.admitCardDate || item.importantDates?.answerKeyDate || item.importantDates?.resultDate)}</div>
                      {dl !== null && dl >= 0 && (
                        <div style={{ fontSize: 11, marginTop: 4, color: dl <= 3 ? '#C62828' : '#2E7D32', fontWeight: 600 }}>
                          {dl === 0 ? '⏰ Today' : `⏰ ${dl}d left`}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        table { width: 100%; }
        tbody tr:nth-child(even) { background: #FAFAFA; }
        tbody tr:nth-child(odd) { background: white; }
        tbody tr:hover { background: #F0F0F0 !important; }
        @media (max-width: 768px) {
          table { font-size: 12px; }
          th, td { padding: 10px 12px !important; }
        }
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
        <TableSection
          icon="📋"
          title="Exam Notifications"
          color="#1565C0"
          items={examNotifications}
          type="notification"
        />

        {/* SECTION 2: LATEST VACANCY */}
        <TableSection
          icon="💼"
          title="Latest Vacancy"
          color="#E65100"
          items={latestJobs}
          type="vacancy"
        />

        {/* SECTION 3: ADMIT CARDS */}
        <TableSection
          icon="🎫"
          title="Admit Cards"
          color="#E65100"
          items={admitCards}
          type="admit-cards"
        />

        {/* SECTION 4: ANSWER KEYS */}
        <TableSection
          icon="📝"
          title="Answer Keys"
          color="#6A1B9A"
          items={answerKeys}
          type="answer-keys"
        />

        {/* SECTION 5: RESULTS */}
        <TableSection
          icon="✅"
          title="Results"
          color="#2E7D32"
          items={results}
          type="results"
        />
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
