// @ts-nocheck
import { connectDB } from '../lib/db'
import SarkariJob from '../models/SarkariJob'
import ExamPortal from '../models/ExamPortal'
import Link from 'next/link'
import type { Metadata } from 'next'
import NewsFeedWidget from '../components/NewsFeedWidget'
import LiveJobsWidget from '../components/LiveJobsWidget'
import SarkariNewsWidget from '../components/SarkariNewsWidget'
import SarkariResultWidget from '../components/SarkariResultWidget'
import SarkariTabs from '../components/SarkariTabs'

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

  const tabs = [
    {
      id: 'notifications',
      icon: '📋',
      label: 'Exam Notifications',
      color: '#1565C0',
      count: examNotifications.length,
      items: examNotifications,
      createLink: '/admin/exam-portal/new?type=job-notification',
    },
    {
      id: 'vacancy',
      icon: '💼',
      label: 'Latest Vacancy',
      color: '#E65100',
      count: latestJobs.length,
      items: latestJobs,
      createLink: '/admin/sarkari/new',
    },
    {
      id: 'admit-cards',
      icon: '🎫',
      label: 'Admit Cards',
      color: '#E65100',
      count: admitCards.length,
      items: admitCards,
      createLink: '/admin/exam-portal/new?type=admit-card',
    },
    {
      id: 'answer-keys',
      icon: '📝',
      label: 'Answer Keys',
      color: '#6A1B9A',
      count: answerKeys.length,
      items: answerKeys,
      createLink: '/admin/exam-portal/new?type=answer-key',
    },
    {
      id: 'results',
      icon: '✅',
      label: 'Results',
      color: '#2E7D32',
      count: results.length,
      items: results,
      createLink: '/admin/exam-portal/new?type=result',
    },
  ]

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
        <SarkariTabs tabs={tabs} />
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
