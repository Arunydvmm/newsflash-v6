'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import Link from 'next/link'

const TYPES = ['job-notification', 'admit-card', 'answer-key', 'result', 'exam-date']
const CATEGORIES = ['SSC', 'UPSC', 'Railway', 'Bank', 'Police', 'Defence', 'Teaching', 'State', 'PSU', 'GATE', 'JEE', 'NEET', 'Other']
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

export default function ExamPortalPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ type: '', category: '', search: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [filter])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.type) params.append('type', filter.type)
      if (filter.category) params.append('category', filter.category)
      if (filter.search) params.append('search', filter.search)
      params.append('limit', '100')
      
      const res = await fetch(`/api/exam-portal?${params}`)
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      console.error('Error fetching items:', err)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    try {
      await fetch(`/api/exam-portal/${id}`, { method: 'DELETE' })
      setItems(items.filter(i => i._id !== id))
    } catch (err) {
      console.error('Error deleting:', err)
    }
  }

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/exam-portal/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !current }),
      })
      const updated = await res.json()
      setItems(items.map(i => i._id === id ? updated : i))
    } catch (err) {
      console.error('Error updating:', err)
    }
  }

  const fmt = (d: any) => d ? new Date(d).toLocaleDateString('en-IN') : '—'

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F8F8F8', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Link href="/admin" style={{ color: '#666', textDecoration: 'none', fontSize: 12 }}>← Admin</Link>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0D1B2A', margin: '8px 0 0' }}>Exam Portal</h1>
            <p style={{ fontSize: 13, color: '#999', margin: '4px 0 0' }}>Manage notifications, admit cards, answer keys, results</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ background: '#C62828', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
            + New Item
          </button>
        </div>

        {/* Filters */}
        <div style={{ background: 'white', padding: 16, borderRadius: 8, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })} style={{ padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }}>
            <option value="">All Types</option>
            {TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
          </select>
          <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })} style={{ padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="text" placeholder="Search..." value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} style={{ padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13, flex: 1, minWidth: 200 }} />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 8 }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 8 }}>No items found</div>
        ) : (
          <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E5E5' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8F8F8', borderBottom: '1px solid #E5E5E5' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#666' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#666' }}>Title</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#666' }}>Organization</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#666' }}>Category</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#666' }}>Exam Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#666' }}>Featured</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#666' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #E5E5E5', hover: { background: '#F8F8F8' } }}>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>
                      <span style={{ background: TYPE_COLORS[item.type], color: 'white', padding: '4px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600 }}>
                        {TYPE_ICONS[item.type]} {item.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#0D1B2A', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>{item.organization}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>{item.category}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#666', fontFamily: 'JetBrains Mono, monospace' }}>{fmt(item.importantDates?.examDate)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button onClick={() => handleToggleFeatured(item._id, item.isFeatured)} style={{ background: item.isFeatured ? '#FFF8E1' : '#F0F0F0', color: item.isFeatured ? '#E65100' : '#999', border: 'none', padding: '4px 8px', borderRadius: 3, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        {item.isFeatured ? '⭐' : '☆'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13 }}>
                      <Link href={`/admin/exam-portal/${item._id}`} style={{ color: '#1565C0', textDecoration: 'none', marginRight: 12 }}>Edit</Link>
                      <button onClick={() => handleDelete(item._id)} style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Quick Add Form */}
        {showForm && (
          <div style={{ background: 'white', padding: 20, borderRadius: 8, marginTop: 20, border: '1px solid #E5E5E5' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Add New Item</h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>Use the form below to quickly add a new exam notification, admit card, answer key, or result. For detailed editing, use the full form after creation.</p>
            <Link href="/admin/exam-portal/new" style={{ display: 'inline-block', background: '#1565C0', color: 'white', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}>
              Open Full Form →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
