'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'

export default function ReviewPage() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/newsroom/article/${id}`)
      .then(res => res.json())
      .then(data => {
        setArticle(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch article:', err)
        setLoading(false)
      })
  }, [id])

  const handleApprove = async () => {
    if (!confirm('Approve and publish this article?')) return
    try {
      const res = await fetch(`/api/newsroom/approve/${id}`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        alert('Article approved and published')
        window.location.href = '/admin/newsroom'
      }
    } catch (err) {
      alert('Failed to approve article')
    }
  }

  const handleReject = async () => {
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    try {
      const res = await fetch(`/api/newsroom/reject/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      const data = await res.json()
      if (data.success) {
        alert('Article rejected')
        window.location.href = '/admin/newsroom'
      }
    } catch (err) {
      alert('Failed to reject article')
    }
  }

  if (loading) return <div style={{ padding: '32px' }}>Loading...</div>
  if (!article) return <div style={{ padding: '32px' }}>Article not found</div>

  return (
    <AdminShell>
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', fontFamily: 'Playfair Display, serif' }}>
            Review Article
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
          {/* Left pane - Content */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Content</h2>
            <div style={{ minHeight: '400px', padding: '16px', background: '#f5f5f5', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
              {article.content}
            </div>
          </div>

          {/* Right pane - Reports */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Confidence: {(article.overallConfidence * 100).toFixed(0)}%</h3>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Risk Level: {article.overallRiskLevel}</h3>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Grade: {article.editorialGrade}</h3>
            </div>

            <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Legal: {article.legalVerdict}</h3>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Copyright: {article.copyrightVerdict}</h3>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Fact Check: {article.factCheckVerdict}</h3>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button
            onClick={handleApprove}
            style={{
              background: '#2E7D32',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            APPROVE & PUBLISH
          </button>
          <button
            onClick={handleReject}
            style={{
              background: '#C62828',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            REJECT
          </button>
        </div>
      </div>
    </AdminShell>
  )
}
