'use client'
// @ts-nocheck
import { useState } from 'react'
import AdminShell from '@/components/admin/AdminShell'

export default function NewsroomSettingsPage() {
  const [schedulerEnabled, setSchedulerEnabled] = useState(true)
  const [storiesPerRun, setStoriesPerRun] = useState(5)

  const handleSave = async () => {
    alert('Settings saved')
  }

  return (
    <AdminShell>
      <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', fontFamily: 'Playfair Display, serif' }}>
            Newsroom Settings
          </h1>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Scheduler</h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={schedulerEnabled}
                onChange={(e) => setSchedulerEnabled(e.target.checked)}
              />
              <span>Enable automatic scheduler (GitHub Actions)</span>
            </label>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Stories per run:</label>
            <select
              value={storiesPerRun}
              onChange={(e) => setStoriesPerRun(parseInt(e.target.value))}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e0e0e0' }}
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Safety Thresholds (Read-only)</h2>
          <div style={{ color: '#666', fontSize: '14px' }}>
            <p><strong>Plagiarism Score:</strong> Must be below 0.60</p>
            <p><strong>Confidence Score:</strong> Must be above 0.70</p>
            <p><strong>Legal/Copyright:</strong> Must be CLEAR (not BLOCKED)</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            background: '#1976D2',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Save Settings
        </button>
      </div>
    </AdminShell>
  )
}
