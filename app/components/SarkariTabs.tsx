'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

interface TabData {
  id: string
  icon: string
  label: string
  color: string
  count: number
  items: any[]
  createLink: string
}

export default function SarkariTabs({ tabs }: { tabs: TabData[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'notifications')

  const activeTabData = tabs.find(t => t.id === activeTab)
  if (!activeTabData) return null

  const fmt = (d: any) => d ? format(new Date(d), 'd MMM yyyy') : '—'
  const daysLeft = (d: any) => {
    if (!d) return null
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
    return diff
  }

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === tab.id ? tab.color : '#E8E8E4',
              color: activeTab === tab.id ? 'white' : '#666',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = '#D8D8D0'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = '#E8E8E4'
              }
            }}
          >
            <span style={{ fontSize: 16 }}>{tab.icon}</span>
            {tab.label}
            <span style={{ fontSize: 11, opacity: 0.8 }}>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* Header with Create Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 28 }}>{activeTabData.icon}</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#0D1B2A', margin: 0 }}>
              {activeTabData.label}
            </h2>
          </div>
          <Link href={activeTabData.createLink} style={{ textDecoration: 'none' }}>
            <button style={{
              background: activeTabData.color,
              color: 'white',
              padding: '10px 16px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              + Create New
            </button>
          </Link>
        </div>

        {/* Content based on tab type */}
        {activeTabData.id === 'vacancy' ? (
          // Latest Vacancy - List view
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeTabData.items.slice(0, 8).map((job: any) => {
              const dl = daysLeft(job.importantDates?.lastDate)
              return (
                <Link key={String(job._id)} href={`/sarkari/${job.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="item-card" style={{ background: 'white', borderRadius: 6, padding: '14px 16px', border: '1px solid #E8E8E4', display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{ width: 40, height: 40, background: activeTabData.color, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💼</div>
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
                  </div>
                </Link>
              )
            })}
          </div>
        ) : activeTabData.id === 'notifications' ? (
          // Exam Notifications - Grid view
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {activeTabData.items.slice(0, 6).map((item: any) => {
              const dl = daysLeft(item.importantDates?.registrationEnd)
              return (
                <div key={String(item._id)} className="item-card" style={{ background: 'white', borderRadius: 8, padding: 16, border: '1px solid #E8E8E4', borderLeft: `4px solid ${activeTabData.color}`, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ background: activeTabData.color, color: 'white', padding: '4px 8px', borderRadius: 3, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{item.category}</span>
                    {dl !== null && dl >= 0 && <span style={{ background: dl <= 3 ? '#FFEBEE' : '#E8F5E9', color: dl <= 3 ? '#C62828' : '#2E7D32', padding: '2px 8px', borderRadius: 2, fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>{dl === 0 ? 'Today' : `${dl}d`}</span>}
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0D1B2A', marginBottom: 4, lineHeight: 1.3, fontFamily: 'Playfair Display, serif' }}>{item.title}</h3>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{item.organization}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {item.applyLink && <a href={item.applyLink} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: activeTabData.color, color: 'white', padding: '8px 12px', borderRadius: 4, textDecoration: 'none', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>Apply</a>}
                    {item.notificationPdf && <a href={item.notificationPdf} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#666', color: 'white', padding: '8px 12px', borderRadius: 4, textDecoration: 'none', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>PDF</a>}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // Admit Cards, Answer Keys, Results - Grid view
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
            {activeTabData.items.slice(0, 6).map((item: any) => (
              <div key={String(item._id)} className="item-card" style={{ background: 'white', borderRadius: 8, padding: 16, border: '1px solid #E8E8E4', borderTop: `4px solid ${activeTabData.color}`, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0D1B2A', marginBottom: 4, fontFamily: 'Playfair Display, serif' }}>{item.title}</h3>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{item.organization}</div>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>📅 {fmt(item.importantDates?.admitCardDate || item.importantDates?.answerKeyDate || item.importantDates?.resultDate)}</div>
                {(item.admitCardLink || item.answerKeyLink || item.resultLink) && (
                  <a href={item.admitCardLink || item.answerKeyLink || item.resultLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: activeTabData.color, color: 'white', padding: '10px 12px', borderRadius: 4, textDecoration: 'none', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
                    {activeTabData.id === 'admit-cards' && 'Download Admit Card'}
                    {activeTabData.id === 'answer-keys' && 'View Answer Key'}
                    {activeTabData.id === 'results' && 'Check Result'}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTabData.items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No items available</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>Check back soon for updates</div>
          </div>
        )}
      </div>
    </div>
  )
}
