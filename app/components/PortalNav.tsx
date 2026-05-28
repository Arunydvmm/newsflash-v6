'use client'
import Link from 'next/link'

export default function PortalNav() {
  return (
    <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '12px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/cricket" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 24, background: 'linear-gradient(135deg,#1B5E20,#2E7D32)', color: 'white', fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(27,94,32,0.35)', transition: 'all 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}>
            🏏 Cricket Live
            <span style={{ background: 'rgba(255,255,255,0.3)', padding: '2px 8px', borderRadius: 6, fontSize: 9, letterSpacing: 1, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>LIVE</span>
          </div>
        </Link>

        <Link href="/exam-portal" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 24, background: 'linear-gradient(135deg,#E65100,#F57C00)', color: 'white', fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(230,81,0,0.35)', transition: 'all 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}>
            🏛 Sarkari Naukri
          </div>
        </Link>

        <Link href="/feed/education" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 24, background: 'linear-gradient(135deg,#283593,#3949AB)', color: 'white', fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(40,53,147,0.35)', transition: 'all 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}>
            🎓 Education
          </div>
        </Link>
      </div>
    </div>
  )
}
