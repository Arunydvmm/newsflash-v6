'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import AdminShell from '../../components/admin/AdminShell'

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #E0DDD5',
  borderRadius: 3, fontSize: 12, outline: 'none',
  fontFamily: 'JetBrains Mono, monospace', background: 'white',
  resize: 'vertical' as const, lineHeight: 1.6,
}

export default function AdsPage() {
  const [slots, setSlots]   = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')
  const [msgType, setMsgType] = useState<'success'|'error'>('success')
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null)

  // Get color based on ad type
  const getDimensionColor = (type: string) => {
    const colors: Record<string, string> = {
      'Popunder': '#C62828',
      'Native': '#E65100',
      'Social Bar': '#1565C0',
      'Smartlink': '#6A1B9A',
      'Banner': '#0D1B2A',
    }
    return colors[type] || '#666'
  }

  useEffect(() => {
    fetch('/api/ads').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setSlots(d)
    })
  }, [])

  function update(i: number, key: string, val: any) {
    const s = [...slots]; s[i] = { ...s[i], [key]: val }; setSlots(s)
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slots),
        credentials: 'include',
      })
      
      const contentType = res.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        setMsg(`✗ Save failed: Server returned ${res.status} - ${res.statusText}. Please login again.`)
        setMsgType('error')
        return
      }
      
      if (res.ok) {
        setMsg('✓ Ad settings saved successfully!')
        setMsgType('success')
      } else {
        const d = await res.json()
        setMsg(`✗ Save failed: ${d.error || res.status}`)
        setMsgType('error')
      }
    } catch (e: any) {
      setMsg(`✗ Save failed: ${e.message}`)
      setMsgType('error')
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 4000)
  }

  const ORDER = ['popunder','native-banner','banner-728x90','banner-300x250','social-bar','smartlink','banner-320x50','banner-160x600','banner-160x300','banner-468x60']
  const sorted = [...slots].sort((a, b) => ORDER.indexOf(a.slotId) - ORDER.indexOf(b.slotId))

  return (
    <AdminShell>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E0DDD5', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, margin: 0 }}>Ad Management</h1>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#aaa', marginTop: 4, letterSpacing: 0.5 }}>
            Manage ad slots · Enable/disable · Paste ad scripts
          </p>
        </div>
        <button onClick={save} disabled={saving}
          style={{ background: '#1A1A1A', color: 'white', border: 'none', padding: '10px 22px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 3, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      <div style={{ padding: 28, maxWidth: 1200 }}>
        {msg && (
          <div style={{ background: msgType === 'success' ? '#E8F5E9' : '#FFEBEE', borderLeft: `3px solid ${msgType === 'success' ? '#2E7D32' : '#C62828'}`, padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: msgType === 'success' ? '#2E7D32' : '#C62828', marginBottom: 20, borderRadius: '0 3px 3px 0' }}>
            {msg}
          </div>
        )}

        {sorted.length === 0 && (
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#aaa', padding: 20, textAlign: 'center' }}>Loading ad slots...</div>
        )}

        {/* Table */}
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: 6, border: '1px solid #E0DDD5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8F8F6', borderBottom: '2px solid #E0DDD5' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1A1A1A', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>Size</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#1A1A1A', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#1A1A1A', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, idx) => {
                const i = slots.findIndex(x => x.slotId === s.slotId)
                const isExpanded = expandedSlot === s.slotId

                return (
                  <tr key={s.slotId} style={{ borderBottom: '1px solid #E0DDD5', background: isExpanded ? '#FAFAF8' : 'white' }}>
                    {/* ID */}
                    <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#0D1B2A', fontWeight: 500 }}>
                      {s.slotId}
                    </td>

                    {/* Name */}
                    <td style={{ padding: '12px 16px', color: '#1A1A1A', fontWeight: 500 }}>
                      {s.name}
                    </td>

                    {/* Type */}
                    <td style={{ padding: '12px 16px', color: '#666' }}>
                      <span style={{ background: getDimensionColor(s.type), color: 'white', padding: '3px 8px', borderRadius: 3, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                        {s.type}
                      </span>
                    </td>

                    {/* Size */}
                    <td style={{ padding: '12px 16px', color: '#666', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 500 }}>
                      {s.size === 'Dynamic' ? '📐 Dynamic' : s.size}
                    </td>

                    {/* Status Toggle */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div onClick={() => update(i, 'enabled', !s.enabled)}
                        style={{ width: 44, height: 24, borderRadius: 12, background: s.enabled ? '#2E7D32' : '#ddd', position: 'relative', cursor: 'pointer', transition: '.2s', display: 'inline-block', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: 'white', top: 3, left: s.enabled ? 23 : 3, transition: '.2s' }} />
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, marginTop: 4, color: s.enabled ? '#2E7D32' : '#aaa', fontWeight: 600, letterSpacing: 0.5 }}>
                        {s.enabled ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                    </td>

                    {/* Expand Button */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button onClick={() => setExpandedSlot(isExpanded ? null : s.slotId)}
                        style={{ background: '#0D1B2A', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 3, cursor: 'pointer', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, letterSpacing: 0.5 }}>
                        {isExpanded ? '▼ CLOSE' : '▶ EDIT'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Expanded Script Editor */}
        {expandedSlot && (
          <div style={{ marginTop: 24, background: 'white', border: '1.5px solid #0D1B2A', borderRadius: 6, padding: 20 }}>
            {sorted.map(s => {
              if (s.slotId !== expandedSlot) return null
              const i = slots.findIndex(x => x.slotId === s.slotId)

              return (
                <div key={s.slotId}>
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: '#0D1B2A', margin: '0 0 4px 0' }}>
                      {s.name}
                    </h3>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#666', margin: 0 }}>
                      {s.position}
                    </p>
                  </div>

                  <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6B6B6B', marginBottom: 8, fontWeight: 600 }}>
                    Ad Script Code
                  </label>
                  <textarea
                    value={s.script}
                    onChange={e => update(i, 'script', e.target.value)}
                    rows={8}
                    placeholder={`Paste your ad script here (including <script> tags)...`}
                    style={inp}
                  />
                  {s.script && (
                    <div style={{ marginTop: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#2E7D32', fontWeight: 600 }}>
                      ✓ Script loaded ({s.script.length} characters)
                    </div>
                  )}

                  <button onClick={() => setExpandedSlot(null)}
                    style={{ marginTop: 16, background: '#E0DDD5', color: '#1A1A1A', border: 'none', padding: '10px 20px', borderRadius: 3, cursor: 'pointer', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, letterSpacing: 0.5 }}>
                    Close Editor
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Save Button */}
        <button onClick={save} disabled={saving}
          style={{ marginTop: 24, background: '#1A1A1A', color: 'white', border: 'none', padding: '12px 28px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 3, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </AdminShell>
  )
}
