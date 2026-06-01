import SkeletonBlock from './SkeletonBlock'

export default function SkeletonCricketPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0D1B2A 0%,#1B5E20 100%)', color: 'white', padding: '16px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SkeletonBlock width={200} height={28} borderRadius={4} style={{ background: 'rgba(255,255,255,0.1)', marginBottom: 12 }} />
          <SkeletonBlock width={300} height={32} borderRadius={4} style={{ background: 'rgba(255,255,255,0.1)', marginBottom: 8 }} />
          <SkeletonBlock width={400} height={16} borderRadius={4} style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#0D1B2A', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 20px', display: 'flex', gap: 0 }}>
        {[...Array(7)].map((_, i) => (
          <SkeletonBlock key={i} width={100} height={40} borderRadius={0} style={{ marginRight: 8, background: 'rgba(255,255,255,0.05)' }} />
        ))}
      </div>

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        {/* Match cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
          {[...Array(4)].map((_, i) => (
            <SkeletonBlock key={i} width="100%" height={160} borderRadius={10} />
          ))}
        </div>
      </main>
    </div>
  )
}