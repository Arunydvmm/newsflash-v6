import SkeletonBlock from './SkeletonBlock'

export default function SkeletonHomePage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '2px solid #0D1B2A', padding: '12px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <SkeletonBlock width={120} height={28} borderRadius={4} />
          <SkeletonBlock width={300} height={40} borderRadius={8} />
          <SkeletonBlock width={60} height={40} borderRadius={4} />
        </div>
      </div>

      {/* Breaking ticker */}
      <div style={{ background: 'linear-gradient(90deg,#C62828,#B71C1C)', height: 40, display: 'flex', alignItems: 'center' }}>
        <SkeletonBlock width="100%" height={20} borderRadius={0} style={{ margin: 0 }} />
      </div>

      {/* Main content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }}>
          {/* Left column */}
          <div>
            {/* Hero slider */}
            <SkeletonBlock width="100%" height={300} borderRadius={12} style={{ marginBottom: 24 }} />

            {/* Featured articles grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 32 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ borderRadius: 8, overflow: 'hidden' }}>
                  <SkeletonBlock width="100%" height={180} borderRadius={8} style={{ marginBottom: 12 }} />
                  <SkeletonBlock width="60%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
                  <SkeletonBlock width="100%" height={14} borderRadius={4} />
                </div>
              ))}
            </div>

            {/* More stories grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 32 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ borderRadius: 8, overflow: 'hidden' }}>
                  <SkeletonBlock width="100%" height={140} borderRadius={8} style={{ marginBottom: 12 }} />
                  <SkeletonBlock width="80%" height={14} borderRadius={4} />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Ad */}
            <SkeletonBlock width="100%" height={250} borderRadius={12} />

            {/* Trending */}
            <div style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid #E5E7EB' }}>
              <SkeletonBlock width="100%" height={16} borderRadius={4} style={{ marginBottom: 12 }} />
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid #F0F0EC' : 'none' }}>
                  <SkeletonBlock width={26} height={24} borderRadius={0} />
                  <SkeletonBlock width="100%" height={14} borderRadius={4} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}