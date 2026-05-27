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

const SLOT_ICONS: Record<string, string> = {
  'popunder':           '🌐',
  'native-banner':      '📰',
  'header-leaderboard': '📏',
  'sidebar-rectangle':  '📦',
  'mid-article':        '📄',
  'mobile-sticky':      '📱',
  'cricket-sidebar':    '🏏',
  'sarkari-sidebar':    '🏛',
}

const SLOT_HINTS: Record<string, string> = {
  'popunder':           'Paste the full <script> tag. Loads globally on all pages.',
  'native-banner':      'Paste the full script + div tags for native ad.',
  'header-leaderboard': '728×90 banner. Paste <script> tags.',
  'sidebar-rectangle':  '300×250 banner. Paste <script> tags.',
  'mid-article':        '728×90 banner shown mid-article.',
  'mobile-sticky':      '320×50 sticky footer on mobile.',
  'cricket-sidebar':    '300×250 shown on cricket page.',
  'sarkari-sidebar':    '300×250 shown on sarkari page.',
}

export default function AdsPage() {
  const [slots, setSlots]   = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')
  const [msgType, setMsgType] = useState<'success'|'error'>('success')

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
      
      // Check if response is JSON
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

  // Sort: popunder first, then native, then rest
  const ORDER = ['popunder','native-banner','header-leaderboard','sidebar-rectangle','mid-article','mobile-sticky','cricket-sidebar','sarkari-sidebar']
  const sorted = [...slots].sort((a, b) => ORDER.indexOf(a.slotId) - ORDER.indexOf(b.slotId))

  return (
    <AdminShell>
      <div style={{ background: 'white', borderBottom: '1px solid #E0DDD5', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, margin: 0 }}>Ad Management</h1>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#aaa', marginTop: 4, letterSpacing: 0.5 }}>
            Toggle slots on/off · Paste ad network scripts · Changes apply site-wide
          </p>
        </div>
        <button onClick={save} disabled={saving}
          style={{ background: '#1A1A1A', color: 'white', border: 'none', padding: '10px 22px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 3, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      <div style={{ padding: 28, maxWidth: 860 }}>
        {msg && (
          <div style={{ background: msgType === 'success' ? '#E8F5E9' : '#FFEBEE', borderLeft: `3px solid ${msgType === 'success' ? '#2E7D32' : '#C62828'}`, padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: msgType === 'success' ? '#2E7D32' : '#C62828', marginBottom: 20, borderRadius: '0 3px 3px 0' }}>
            {msg}
          </div>
        )}

        {sorted.length === 0 && (
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#aaa', padding: 20, textAlign: 'center' }}>Loading ad slots...</div>
        )}

        {sorted.map((s, idx) => {
          const i = slots.findIndex(x => x.slotId === s.slotId)
          const icon = SLOT_ICONS[s.slotId] || '📢'
          const hint = SLOT_HINTS[s.slotId] || ''
          const isGlobal = s.slotId === 'popunder'
          const isNative = s.slotId === 'native-banner'

          return (
            <div key={s.slotId} style={{ background: 'white', border: `1.5px solid ${s.enabled ? '#1A1A1A' : '#E0DDD5'}`, borderRadius: 6, padding: 20, marginBottom: 14, transition: 'border-color 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 24 }}>{icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {s.name}
                      {isGlobal && <span style={{ background: '#0D1B2A', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, padding: '2px 7px', borderRadius: 3, letterSpacing: 1 }}>GLOBAL</span>}
                      {isNative && <span style={{ background: '#E65100', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, padding: '2px 7px', borderRadius: 3, letterSpacing: 1 }}>NATIVE</span>}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#aaa', marginTop: 3 }}>
                      {s.size} · {s.position}
                    </div>
                    {hint && <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#888', marginTop: 4 }}>ℹ {hint}</div>}
                  </div>
                </div>

                {/* Toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: s.enabled ? '#2E7D32' : '#aaa' }}>
                    {s.enabled ? 'ON' : 'OFF'}
                  </span>
                  <div onClick={() => update(i, 'enabled', !s.enabled)}
                    style={{ width: 44, height: 24, borderRadius: 12, background: s.enabled ? '#1A1A1A' : '#ddd', position: 'relative', cursor: 'pointer', transition: '.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: 'white', top: 3, left: s.enabled ? 23 : 3, transition: '.2s' }} />
                  </div>
                </label>
              </div>

              <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6B6B6B', marginBottom: 6 }}>
                Ad Script
              </label>
              <textarea
                value={s.script}
                onChange={e => update(i, 'script', e.target.value)}
                rows={isNative ? 5 : 4}
                placeholder={`Paste your ${s.name} ad code here...`}
                style={inp}
              />
              {s.script && (
                <div style={{ marginTop: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#2E7D32' }}>
                  ✓ Script loaded ({s.script.length} chars)
                </div>
              )}
            </div>
          )
        })}

        <button onClick={save} disabled={saving}
          style={{ background: '#1A1A1A', color: 'white', border: 'none', padding: '12px 28px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 3, marginTop: 8, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save Ad Settings'}
        </button>
      </div>
    </AdminShell>
  )
}
