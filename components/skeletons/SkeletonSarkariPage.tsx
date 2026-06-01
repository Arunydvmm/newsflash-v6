import SkeletonBlock from './SkeletonBlock'

export default function SkeletonSarkariPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#1B5E20', color: 'white', padding: '24px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SkeletonBlock width={100} height={16} borderRadius={4} style={{ background: 'rgba(255,255,255,0.1)', marginBottom: 12 }} />
          <SkeletonBlock width={300} height={32} borderRadius={4} style={{ background: 'rgba(255,255,255,0.1)', marginBottom: 8 }} />
          <SkeletonBlock width={400} height={16} borderRadius={4} style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>
      </div>

      {/* Main content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        {/* Table sections */}
        {[...Array(4)].map((_, section) => (
          <div key={section} style={{ marginBottom: 40 }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <SkeletonBlock width={24} height={24} borderRadius={4} />
              <SkeletonBlock width={200} height={22} borderRadius={4} />
              <SkeletonBlock width={80} height={20} borderRadius={20} style={{ marginLeft: 'auto' }} />
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: 8, border: '1px solid #E8E8E4', overflow: 'hidden' }}>
              {/* Header row */}
              <div style={{ display: 'flex', gap: 4, padding: '14px 16px', borderBottom: '2px solid #E8E8E4', background: '#F8F8F8' }}>
                {[...Array(5)].map((_, i) => (
                  <SkeletonBlock key={i} width={100} height={12} borderRadius={4} />
                ))}
              </div>

              {/* Data rows */}
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 4, padding: '14px 16px', borderBottom: '1px solid #E8E8E4' }}>
                  {[...Array(5)].map((_, j) => (
                    <SkeletonBlock key={j} width={100} height={12} borderRadius={4} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}