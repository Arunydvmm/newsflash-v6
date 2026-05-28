'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TYPES = ['job-notification', 'admit-card', 'answer-key', 'result', 'exam-date']
const CATEGORIES = ['SSC', 'UPSC', 'Railway', 'Bank', 'Police', 'Defence', 'Teaching', 'State', 'PSU', 'GATE', 'JEE', 'NEET', 'Other']

export default function ExamPortalFormPage({ params }: any) {
  const router = useRouter()
  const isNew = params.id === 'new'
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: 'job-notification',
    organization: '',
    examName: '',
    category: 'SSC',
    state: 'All India',
    totalVacancy: 0,
    qualification: [],
    salaryText: '',
    ageMin: 18,
    ageMax: 35,
    admitCardLink: '',
    answerKeyLink: '',
    setsAvailable: [],
    resultLink: '',
    importantDates: {
      notificationDate: '',
      registrationStart: '',
      registrationEnd: '',
      examDate: '',
      admitCardDate: '',
      answerKeyDate: '',
      resultDate: '',
    },
    description: '',
    eligibility: '',
    howToApply: '',
    officialWebsite: '',
    applyLink: '',
    notificationPdf: '',
    tags: [],
    isFeatured: false,
  })

  useEffect(() => {
    if (!isNew) {
      fetchItem()
    }
  }, [])

  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/exam-portal/${params.id}`)
      const data = await res.json()
      setForm(data)
    } catch (err) {
      console.error('Error fetching:', err)
    }
    setLoading(false)
  }

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value })
  }

  const handleDateChange = (field: string, value: string) => {
    setForm({
      ...form,
      importantDates: { ...form.importantDates, [field]: value },
    })
  }

  const handleArrayChange = (field: string, value: string) => {
    const arr = value.split(',').map(v => v.trim()).filter(v => v)
    setForm({ ...form, [field]: arr })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? '/api/exam-portal' : `/api/exam-portal/${params.id}`
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.push('/admin/exam-portal')
      }
    } catch (err) {
      console.error('Error saving:', err)
    }
    setSaving(false)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F8F8F8', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Link href="/admin/exam-portal" style={{ color: '#666', textDecoration: 'none', fontSize: 12 }}>← Back</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0D1B2A', margin: '12px 0 24px' }}>{isNew ? 'New Exam Item' : 'Edit Exam Item'}</h1>

        <div style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid #E5E5E5' }}>
          {/* Basic Info */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Basic Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Title *</label>
                <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Type *</label>
                <select value={form.type} onChange={e => handleChange('type', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Organization *</label>
                <input type="text" value={form.organization} onChange={e => handleChange('organization', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Exam Name *</label>
                <input type="text" value={form.examName} onChange={e => handleChange('examName', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Category *</label>
                <select value={form.category} onChange={e => handleChange('category', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>State</label>
                <input type="text" value={form.state} onChange={e => handleChange('state', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
              </div>
            </div>
          </div>

          {/* Important Dates */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Important Dates</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {['notificationDate', 'registrationStart', 'registrationEnd', 'examDate', 'admitCardDate', 'answerKeyDate', 'resultDate'].map(field => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <input type="date" value={form.importantDates[field]?.split('T')[0] || ''} onChange={e => handleDateChange(field, e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Job Details (if job-notification) */}
          {form.type === 'job-notification' && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Job Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Total Vacancies</label>
                  <input type="number" value={form.totalVacancy} onChange={e => handleChange('totalVacancy', parseInt(e.target.value))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Salary</label>
                  <input type="text" value={form.salaryText} onChange={e => handleChange('salaryText', e.target.value)} placeholder="e.g., Rs. 25,000 - 50,000" style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Age Min</label>
                  <input type="number" value={form.ageMin} onChange={e => handleChange('ageMin', parseInt(e.target.value))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Age Max</label>
                  <input type="number" value={form.ageMax} onChange={e => handleChange('ageMax', parseInt(e.target.value))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Qualifications (comma-separated)</label>
                  <input type="text" value={form.qualification.join(', ')} onChange={e => handleArrayChange('qualification', e.target.value)} placeholder="e.g., Bachelor's Degree, 12th Pass" style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
                </div>
              </div>
            </div>
          )}

          {/* Links */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Links & Resources</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Official Website</label>
                <input type="url" value={form.officialWebsite} onChange={e => handleChange('officialWebsite', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Apply Link</label>
                <input type="url" value={form.applyLink} onChange={e => handleChange('applyLink', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
              </div>
              {form.type === 'admit-card' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Admit Card Link</label>
                  <input type="url" value={form.admitCardLink} onChange={e => handleChange('admitCardLink', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
                </div>
              )}
              {form.type === 'answer-key' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Answer Key Link</label>
                  <input type="url" value={form.answerKeyLink} onChange={e => handleChange('answerKeyLink', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
                </div>
              )}
              {form.type === 'result' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Result Link</label>
                  <input type="url" value={form.resultLink} onChange={e => handleChange('resultLink', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Notification PDF</label>
                <input type="url" value={form.notificationPdf} onChange={e => handleChange('notificationPdf', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Content</h3>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Description</label>
              <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13, minHeight: 100, fontFamily: 'monospace' }} />
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Eligibility</label>
              <textarea value={form.eligibility} onChange={e => handleChange('eligibility', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13, minHeight: 80, fontFamily: 'monospace' }} />
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>How to Apply</label>
              <textarea value={form.howToApply} onChange={e => handleChange('howToApply', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13, minHeight: 80, fontFamily: 'monospace' }} />
            </div>
          </div>

          {/* Tags & Featured */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Tags (comma-separated)</label>
                <input type="text" value={form.tags.join(', ')} onChange={e => handleArrayChange('tags', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 4, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 600, marginTop: 24, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isFeatured} onChange={e => handleChange('isFeatured', e.target.checked)} style={{ marginRight: 8 }} />
                  Featured
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleSave} disabled={saving} style={{ background: '#1565C0', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <Link href="/admin/exam-portal" style={{ background: '#E5E5E5', color: '#0D1B2A', border: 'none', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, display: 'inline-block' }}>
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
