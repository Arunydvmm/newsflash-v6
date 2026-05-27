'use client'
// @ts-nocheck
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import SaveStatusPopup, { SaveStatus } from '../SaveStatusPopup'

const CATEGORIES = ['Railway','SSC','UPSC','Police','Defence','Bank','Teaching','State','PSU','Internship','Private','Other']
const STATES = ['All India','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh']
const QUALIFICATIONS = ['10th Pass','12th Pass','ITI','Diploma','Graduate','Post Graduate','B.Tech/B.E.','MBA','MBBS','LLB','CA','Any Graduate']

const inp = { width: '100%', padding: '9px 12px', border: '1px solid #E0DDD5', borderRadius: 4, fontFamily: 'Inter, sans-serif', fontSize: 13, outline: 'none', background: 'white' }
const lbl = { display: 'block', marginBottom: 5, fontSize: 11, fontWeight: 600, color: '#444', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.5, textTransform: 'uppercase' as const }

// ── HTML Import Parser ──────────────────────────────────────────────
function parseHTMLJob(html: string) {
  const parser = new DOMParser()
  const doc    = parser.parseFromString(html, 'text/html')

  // Extract title
  const h1    = doc.querySelector('h1')
  const title = h1?.textContent?.trim() || doc.title?.replace(/\s*[-|–]\s*.*$/, '').trim() || ''

  // Remove nav, header, footer, script, style, ads
  const removeSelectors = [
    'nav','header','footer','script','style','aside',
    '.breadcrumb','[class*="breadcrumb"]',
    '[class*="nav"]','[class*="footer"]','[class*="header"]',
    '[class*="sidebar"]','[class*="advertisement"]','[class*="ad-"]',
    '[class*="ads"]','[id*="ad"]','[id*="ads"]',
  ]
  removeSelectors.forEach(sel => {
    doc.querySelectorAll(sel).forEach(el => el.remove())
  })
  doc.querySelectorAll('h1').forEach(el => el.remove())

  // Main content
  const contentEl = doc.querySelector('article') || doc.querySelector('main') || doc.querySelector('[class*="article"]') || doc.querySelector('[class*="content"]') || doc.body
  let content = contentEl?.innerHTML?.trim() || ''

  content = content
    .replace(/<div[^>]*class="[^"]*(?:wrapper|container|row|col|grid|flex|layout)[^"]*"[^>]*>\s*<\/div>/gi, '')
    .replace(/\s+on\w+="[^"]*"/gi, '')
    .replace(/\s+data-(?:track|analytics|ga)[^=]*="[^"]*"/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  // Extract description (first meaningful paragraph or table)
  let description = ''
  const paras = doc.querySelectorAll('p')
  for (const p of paras) {
    const text = p.textContent?.trim() || ''
    if (text.length > 50) { description = text.slice(0, 500); break }
  }

  // Extract organization from title or content
  const titleLower = title.toLowerCase()
  let organization = ''
  if (titleLower.includes('ssc')) organization = 'Staff Selection Commission'
  else if (titleLower.includes('upsc')) organization = 'Union Public Service Commission'
  else if (titleLower.includes('railway')) organization = 'Indian Railways'
  else if (titleLower.includes('bank')) organization = 'Banking Sector'
  else if (titleLower.includes('police')) organization = 'Police Department'

  // Guess category
  let category = 'SSC'
  if (titleLower.includes('railway')) category = 'Railway'
  else if (titleLower.includes('upsc')) category = 'UPSC'
  else if (titleLower.includes('police')) category = 'Police'
  else if (titleLower.includes('bank')) category = 'Bank'
  else if (titleLower.includes('defence')) category = 'Defence'

  return { title, organization, description, category, content }
}

export default function SarkariJobForm({ job = null }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const importRef  = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title:           job?.title           || '',
    organization:    job?.organization    || '',
    category:        job?.category        || 'SSC',
    state:           job?.state           || 'All India',
    totalVacancy:    job?.totalVacancy    || '',
    salaryText:      job?.salaryText      || '',
    ageMin:          job?.ageMin          || 18,
    ageMax:          job?.ageMax          || 35,
    applicationFee:  job?.applicationFee  || 'No Fee',
    description:     job?.description     || '',
    eligibility:     job?.eligibility     || '',
    howToApply:      job?.howToApply      || '',
    officialWebsite: job?.officialWebsite || '',
    applyLink:       job?.applyLink       || '',
    notificationPdf: job?.notificationPdf || '',
    tags:            job?.tags?.join(', ') || '',
    isFeatured:      job?.isFeatured      || false,
    notificationDate: job?.importantDates?.notificationDate?.split?.('T')?.[0] || '',
    startDate:        job?.importantDates?.startDate?.split?.('T')?.[0]        || '',
    lastDate:         job?.importantDates?.lastDate?.split?.('T')?.[0]         || '',
    examDate:         job?.importantDates?.examDate?.split?.('T')?.[0]         || '',
    qualification:    job?.qualification  || [],
    selectionProcess: job?.selectionProcess?.join(', ') || '',
  })

  const set = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const toggleQual = (q: string) => {
    setForm(p => ({
      ...p,
      qualification: p.qualification.includes(q) ? p.qualification.filter((x: string) => x !== q) : [...p.qualification, q],
    }))
  }

  function handleHTMLImport(e: any) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportMsg('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const html = ev.target?.result as string
        const parsed = parseHTMLJob(html)
        setForm(p => ({
          ...p,
          title:        parsed.title        || p.title,
          organization: parsed.organization || p.organization,
          description:  parsed.description  || p.description,
          category:     parsed.category     || p.category,
          eligibility:  parsed.content      || p.eligibility,
        }))
        setImportMsg(`✓ Imported: "${parsed.title.slice(0, 60)}${parsed.title.length > 60 ? '...' : ''}"`)
      } catch (err) {
        setImportMsg('✗ Failed to parse HTML file')
      } finally {
        setImporting(false)
        if (importRef.current) importRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  async function submit(e: any) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaveStatus('saving')
    setSaveMessage('')
    const payload = {
      title: form.title,
      organization: form.organization,
      category: form.category,
      state: form.state,
      totalVacancy: Number(form.totalVacancy) || 0,
      salaryText: form.salaryText,
      ageMin: Number(form.ageMin),
      ageMax: Number(form.ageMax),
      applicationFee: form.applicationFee,
      description: form.description,
      eligibility: form.eligibility,
      howToApply: form.howToApply,
      officialWebsite: form.officialWebsite,
      applyLink: form.applyLink,
      notificationPdf: form.notificationPdf,
      tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      isFeatured: form.isFeatured,
      qualification: form.qualification,
      selectionProcess: form.selectionProcess.split(',').map((t: string) => t.trim()).filter(Boolean),
      importantDates: {
        notificationDate: form.notificationDate || undefined,
        startDate:        form.startDate        || undefined,
        lastDate:         form.lastDate         || undefined,
        examDate:         form.examDate         || undefined,
      },
    }
    const url    = job ? `/api/sarkari/${job._id}` : '/api/sarkari'
    const method = job ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      const errMsg = data.error || 'Failed to save job'
      setError(errMsg)
      setSaveStatus('error')
      setSaveMessage(errMsg)
      setLoading(false)
      return
    }
    setSaveStatus('published')
    setSaveMessage(job ? 'Job listing updated successfully' : 'Job listing posted successfully')
    setTimeout(() => router.push('/admin/sarkari'), 2000)
  }

  return (
    <form onSubmit={submit} style={{ background: 'white', padding: 28, borderRadius: 6 }}>
      <SaveStatusPopup status={saveStatus} message={saveMessage} onClose={() => setSaveStatus('idle')} />
      {error && <div style={{ background: '#FFEBEE', color: '#C62828', padding: '10px 14px', borderRadius: 4, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      {/* ── HTML IMPORT ── */}
      <div style={{ marginBottom: 24, padding: '14px 18px', background: 'linear-gradient(135deg,#F0F4FF,#EEF2FF)', border: '1.5px dashed #6366F1', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#4338CA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>
            📥 Import from HTML
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#6366F1' }}>
            Upload an .html file — title, organization, description & category auto-filled
          </div>
          {importMsg && (
            <div style={{ marginTop: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: importMsg.startsWith('✓') ? '#2E7D32' : '#C62828', fontWeight: 600 }}>
              {importMsg}
            </div>
          )}
        </div>
        <button type="button" onClick={() => importRef.current?.click()} disabled={importing}
          style={{ background: '#4338CA', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 6, cursor: importing ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, letterSpacing: 0.5, opacity: importing ? 0.7 : 1, whiteSpace: 'nowrap' }}>
          {importing ? '⏳ Importing...' : '📂 Choose HTML File'}
        </button>
        <input ref={importRef} type="file" accept=".html,.htm" style={{ display: 'none' }} onChange={handleHTMLImport} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div><label style={lbl}>Job Title *</label><input name="title" value={form.title} onChange={set} required style={inp} /></div>
        <div><label style={lbl}>Organization *</label><input name="organization" value={form.organization} onChange={set} required style={inp} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div><label style={lbl}>Category *</label>
          <select name="category" value={form.category} onChange={set} style={inp}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
        </div>
        <div><label style={lbl}>State</label>
          <select name="state" value={form.state} onChange={set} style={inp}>{STATES.map(s => <option key={s}>{s}</option>)}</select>
        </div>
        <div><label style={lbl}>Total Vacancy</label><input name="totalVacancy" type="number" value={form.totalVacancy} onChange={set} style={inp} /></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div><label style={lbl}>Salary / Pay Scale</label><input name="salaryText" value={form.salaryText} onChange={set} placeholder="₹35,400 - ₹1,12,400" style={inp} /></div>
        <div><label style={lbl}>Age Min</label><input name="ageMin" type="number" value={form.ageMin} onChange={set} style={inp} /></div>
        <div><label style={lbl}>Age Max</label><input name="ageMax" type="number" value={form.ageMax} onChange={set} style={inp} /></div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>Application Fee</label>
        <input name="applicationFee" value={form.applicationFee} onChange={set} placeholder="No Fee / ₹100 (General), ₹0 (SC/ST)" style={inp} />
      </div>

      {/* Important Dates */}
      <div style={{ marginBottom: 16, padding: 16, background: '#F8F8F6', borderRadius: 4, border: '1px solid #E0DDD5' }}>
        <label style={{ ...lbl, marginBottom: 12 }}>Important Dates</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
          <div><label style={lbl}>Notification Date</label><input name="notificationDate" type="date" value={form.notificationDate} onChange={set} style={inp} /></div>
          <div><label style={lbl}>Start Date</label><input name="startDate" type="date" value={form.startDate} onChange={set} style={inp} /></div>
          <div><label style={lbl}>Last Date *</label><input name="lastDate" type="date" value={form.lastDate} onChange={set} required style={inp} /></div>
          <div><label style={lbl}>Exam Date</label><input name="examDate" type="date" value={form.examDate} onChange={set} style={inp} /></div>
        </div>
      </div>

      {/* Qualification */}
      <div style={{ marginBottom: 16, padding: 16, background: '#F8F8F6', borderRadius: 4, border: '1px solid #E0DDD5' }}>
        <label style={{ ...lbl, marginBottom: 10 }}>Qualification Required</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {QUALIFICATIONS.map(q => (
            <label key={q} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, padding: '4px 10px', background: form.qualification.includes(q) ? '#0D1B2A' : 'white', color: form.qualification.includes(q) ? 'white' : '#444', borderRadius: 3, border: '1px solid #E0DDD5' }}>
              <input type="checkbox" checked={form.qualification.includes(q)} onChange={() => toggleQual(q)} style={{ display: 'none' }} />
              {q}
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>Description *</label>
        <textarea name="description" value={form.description} onChange={set} required rows={5} style={{ ...inp, resize: 'vertical' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>Eligibility Criteria</label>
        <textarea name="eligibility" value={form.eligibility} onChange={set} rows={3} style={{ ...inp, resize: 'vertical' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>How to Apply</label>
        <textarea name="howToApply" value={form.howToApply} onChange={set} rows={3} style={{ ...inp, resize: 'vertical' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>Selection Process (comma-separated)</label>
        <input name="selectionProcess" value={form.selectionProcess} onChange={set} placeholder="Written Exam, Physical Test, Interview" style={inp} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div><label style={lbl}>Official Website</label><input name="officialWebsite" type="url" value={form.officialWebsite} onChange={set} placeholder="https://..." style={inp} /></div>
        <div><label style={lbl}>Apply Link</label><input name="applyLink" type="url" value={form.applyLink} onChange={set} placeholder="https://..." style={inp} /></div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>Notification PDF URL</label>
        <input name="notificationPdf" type="url" value={form.notificationPdf} onChange={set} placeholder="https://..." style={inp} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Tags (comma-separated)</label>
        <input name="tags" value={form.tags} onChange={set} placeholder="SSC, CGL, Graduate" style={inp} />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, marginBottom: 20 }}>
        <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={set} />
        ⭐ Feature this job (shown prominently)
      </label>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" disabled={loading} style={{ background: '#1B5E20', color: 'white', padding: '11px 24px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Saving...' : job ? 'Update Job' : 'Post Job'}
        </button>
        <button type="button" onClick={() => router.back()} style={{ background: 'white', color: '#888', padding: '11px 20px', border: '1px solid #E0DDD5', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
          Cancel
        </button>
      </div>
    </form>
  )
}
