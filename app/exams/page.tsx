// @ts-nocheck
import { connectDB } from '../lib/db'
import ExamPortal from '../models/ExamPortal'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import AdSlotServer from '../components/AdSlotServer'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Exam Portal 2026 — Answer Keys, Admit Cards, Results',
  description: 'Latest exam notifications, admit cards, answer keys, and results for SSC, UPSC, Railway, Bank, GATE, JEE, NEET and more.',
  keywords: ['exam portal', 'answer keys', 'admit cards', 'exam results', 'exam notifications', 'SSC', 'UPSC', 'GATE', 'JEE', 'NEET'],
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
const TYPE_LABELS: Record<string, string> = {
  'job-notification': 'Job Notification',
  'admit-card': 'Admit Card',
  'answer-key': 'Answer Key',
  'result': 'Result',
  'exam-date': 'Exam Date',
}

export default async function ExamsPage({ searchParams }: any) {
  await connectDB()
  const type = searchParams?.type || ''
  const category = searchParams?.category || ''
  const search = searchParams?.search || ''

  const q: any = { isActive: true, isExpired: false }
  if (type) q.type = type
  if (category) q.category = category
  if (search) q.$text = { $search: search }

  const [items, featured, typeCounts, categoryCounts] = await Promise.all([
    ExamPortal.find(q).sort({ isFeatured: -1, createdAt: -1 }).limit(50).lean(),
    ExamPortal.find({ isActive: true, isExpired: false, isFeatured: true }).sort({ createdAt: -1 }).limit(8).lean(),
    ExamPortal.aggregate([
      { $match: { isActive: true, isExpired: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    ExamPortal.aggregate([
      { $match: { isActive: true, isExpired: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
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
        .exam-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); transform: translateY(-1px); }
        .exam-card { transition: all 0.2s; }
        @media (max-width: 768px) {
          .exam-grid { grid-template-columns: 1fr !important; }
          .type-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .main-pad { padding: 16px 14px !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #6A1B9A, #8E24AA)', color: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>← NewsFlash</Link>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 900, marginTop: 8, marginBottom: 4 }}>
            Exam Portal
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Answer Keys • Admit Cards • Results • Notifications</div>
        </div>
      </header>

      {/* Type Navigation */}
      <div style={{ background: '#5E35B1', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[{ label: 'All', value: '' }, ...Object.entries(TYPE_LABELS).map(([k, v]) => ({ label: v, value: k }))].map(t => (
            <Link key={t.value} href={`/exams${t.value ? `?type=${t.value}` : ''}`}
              style={{ padding: '12px 16px', color: type === t.value ? 'white' : 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap', borderBottom: type === t.value ? '3px solid #CE93D8' : '3px solid transparent', flexShrink: 0 }}>
              {TYPE_ICONS[t.value] || '📌'} {t.label}
            </Link>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto' }} className="main-pad" style={{ padding: '24px 20px' }}>
        {/* Featured Section */}
        {!type && !category && !search && featured.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#888', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: '#E65100', color: 'white', padding: '2px 8px', borderRadius: 2, fontSize: 9 }}>⭐ FEATURED</span>
              Important Updates
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {featured.map((item: any) => {
                const dl = daysLeft(item.importantDates?.examDate)
                return (
                  <div key={String(item._id)} className="exam-card"
                    style={{ background: 'white', borderRadius: 8, padding: 16, border: '1px solid #E8E8E4', borderLeft: `4px solid ${TYPE_COLORS[item.type]}`, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ background: TYPE_COLORS[item.type], color: 'white', padding: '4px 8px', borderRadius: 3, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                        {TYPE_ICONS[item.type]} {TYPE_LABELS[item.type]}
                      </span>
                      {dl !== null && dl >= 0 && <span style={{ background: dl <= 3 ? '#FFEBEE' : '#E8F5E9', color: dl <= 3 ? '#C62828' : '#2E7D32', padding: '2px 8px', borderRadius: 2, fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{dl === 0 ? 'Today' : `${dl}d`}</span>}
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0D1B2A', marginBottom: 4, lineHeight: 1.3, fontFamily: 'Playfair Display, serif' }}>{item.title}</h3>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{item.organization}</div>
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 8, flex: 1 }}>{item.category}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      {item.applyLink && (
                        <a href={item.applyLink} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: TYPE_COLORS[item.type], color: 'white', padding: '8px 12px', borderRadius: 4, textDecoration: 'none', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                          Apply
                        </a>
                      )}
                      {item.admitCardLink && (
                        <a href={item.admitCardLink} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#E65100', color: 'white', padding: '8px 12px', borderRadius: 4, textDecoration: 'none', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                          Admit Card
                        </a>
                      )}
                      {item.answerKeyLink && (
                        <a href={item.answerKeyLink} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#6A1B9A', color: 'white', padding: '8px 12px', borderRadius: 4, textDecoration: 'none', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                          Answer Key
                        </a>
                      )}
                      {item.resultLink && (
                        <a href={item.resultLink} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#2E7D32', color: 'white', padding: '8px 12px', borderRadius: 4, textDecoration: 'none', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                          Result
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Category Stats */}
        {!type && !search && (
          <div className="type-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
            {typeCounts.slice(0, 5).map((c: any) => (
              <Link key={c._id} href={`/exams?type=${c._id}`}
                style={{ background: 'white', borderRadius: 6, padding: '14px 12px', textAlign: 'center', textDecoration: 'none', border: '1px solid #E8E8E4', borderTop: `3px solid ${TYPE_COLORS[c._id]}` }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{TYPE_ICONS[c._id]}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0D1B2A' }}>{TYPE_LABELS[c._id]}</div>
                <div style={{ fontSize: 11, color: '#888', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{c.count} items</div>
              </Link>
            ))}
          </div>
        )}

        {/* All Items */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#888' }}>
            {search ? `Results for "${search}"` : type ? `${TYPE_LABELS[type]}` : category ? `${category}` : 'Latest Updates'} — {items.length} found
          </div>
          {(search || type || category) && (
            <Link href="/exams" style={{ fontSize: 11, color: '#C62828', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}>Clear Filter ×</Link>
          )}
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 6 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#aaa' }}>No items found</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item: any) => {
              const dl = daysLeft(item.importantDates?.examDate)
              return (
                <div key={String(item._id)} className="exam-card"
                  style={{ background: 'white', borderRadius: 6, padding: '16px 20px', border: '1px solid #E8E8E4', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, background: TYPE_COLORS[item.type], borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {TYPE_ICONS[item.type]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ background: TYPE_COLORS[item.type], color: 'white', padding: '2px 8px', borderRadius: 2, fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{TYPE_LABELS[item.type]}</span>
                      <span style={{ background: '#F0F0EC', color: '#666', padding: '2px 8px', borderRadius: 2, fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>{item.category}</span>
                      {item.isFeatured && <span style={{ background: '#FFF8E1', color: '#E65100', padding: '2px 8px', borderRadius: 2, fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>⭐ FEATURED</span>}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0D1B2A', marginBottom: 2, fontFamily: 'Playfair Display, serif', lineHeight: 1.3 }}>{item.title}</h3>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{item.organization}</div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#666', fontFamily: 'JetBrains Mono, monospace', flexWrap: 'wrap' }}>
                      {item.totalVacancy > 0 && <span>📋 {item.totalVacancy.toLocaleString('en-IN')} Vacancies</span>}
                      {item.salaryText && <span>💰 {item.salaryText}</span>}
                      {item.importantDates?.examDate && <span>📅 {fmt(item.importantDates.examDate)}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {dl !== null && dl >= 0 && (
                      <div style={{ background: dl <= 3 ? '#FFEBEE' : '#E8F5E9', color: dl <= 3 ? '#C62828' : '#2E7D32', padding: '4px 8px', borderRadius: 3, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, textAlign: 'center' }}>
                        {dl === 0 ? 'Today' : `${dl} days`}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {item.applyLink && <a href={item.applyLink} target="_blank" rel="noopener noreferrer" style={{ background: TYPE_COLORS[item.type], color: 'white', padding: '4px 8px', borderRadius: 3, textDecoration: 'none', fontSize: 10, fontWeight: 600 }}>Apply</a>}
                      {item.admitCardLink && <a href={item.admitCardLink} target="_blank" rel="noopener noreferrer" style={{ background: '#E65100', color: 'white', padding: '4px 8px', borderRadius: 3, textDecoration: 'none', fontSize: 10, fontWeight: 600 }}>Card</a>}
                      {item.answerKeyLink && <a href={item.answerKeyLink} target="_blank" rel="noopener noreferrer" style={{ background: '#6A1B9A', color: 'white', padding: '4px 8px', borderRadius: 3, textDecoration: 'none', fontSize: 10, fontWeight: 600 }}>Key</a>}
                      {item.resultLink && <a href={item.resultLink} target="_blank" rel="noopener noreferrer" style={{ background: '#2E7D32', color: 'white', padding: '4px 8px', borderRadius: 3, textDecoration: 'none', fontSize: 10, fontWeight: 600 }}>Result</a>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Ad Slot */}
      <div style={{ maxWidth: 1200, margin: '32px auto 0', padding: '0 20px 32px' }}>
        <div style={{ background: 'white', borderRadius: 8, padding: 12, textAlign: 'center' }}>
          <AdSlotServer slotId="banner-728x90" style={{ minHeight: 90 }} />
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#0D1B2A', color: 'rgba(255,255,255,0.6)', marginTop: 48, padding: '20px', textAlign: 'center', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>← Back to NewsFlash</Link>
        <span style={{ margin: '0 12px' }}>·</span>
        © {new Date().getFullYear()} NewsFlash Media
      </footer>
    </div>
  )
}
