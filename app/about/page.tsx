// @ts-nocheck
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us — NewsFlash',
  description: 'About NewsFlash — India\'s fastest digital newsroom covering breaking news, IPL live scores, Sarkari Naukri, cricket analytics and education updates.',
}

export default function AboutPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      <header style={{ background: 'white', borderBottom: '3px solid #0D1B2A', padding: '14px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: '#0D1B2A', textDecoration: 'none' }}>
            NEWS<span style={{ color: '#C62828' }}>FLASH</span>
          </Link>
          <Link href="/" style={{ fontSize: 12, color: '#333333', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}>← Back to Home</Link>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg,#0D1B2A,#1B2B3A)', borderRadius: 16, padding: '48px 40px', marginBottom: 28, textAlign: 'center', color: 'white' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 900, marginBottom: 8 }}>
            NEWS<span style={{ color: '#C62828' }}>FLASH</span>
          </div>
          <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg,#C62828,#D4A017)', borderRadius: 2, margin: '0 auto 20px' }} />
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>
            India's fastest digital newsroom — breaking news, IPL live scores, Sarkari Naukri, cricket analytics and education updates. Updated 24/7.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: '40px 48px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: '#0D1B2A', marginBottom: 16 }}>Our Mission</h2>
          <p style={{ fontSize: 15, color: '#444', lineHeight: 1.9, marginBottom: 16 }}>
            NewsFlash was built with one goal: to give every Indian access to fast, reliable, and comprehensive news — from breaking headlines to live cricket scores to government job notifications — all in one place.
          </p>
          <p style={{ fontSize: 15, color: '#444', lineHeight: 1.9 }}>
            We believe information should be free, fast, and accessible. Whether you're a student tracking exam results, a cricket fan following IPL live scores, or a job seeker looking for Sarkari Naukri — NewsFlash is your one-stop destination.
          </p>
        </div>

        {/* What we cover */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
          {[
            { icon: '📰', title: 'Breaking News', desc: 'India, World, Business, Technology, Sports, Health, Entertainment — updated 24/7', color: '#C62828' },
            { icon: '🏏', title: 'Cricket Live', desc: 'IPL live scores, points table, Orange Cap, Purple Cap, match scorecards', color: '#1B5E20' },
            { icon: '🏛', title: 'Sarkari Naukri', desc: 'Railway, SSC, UPSC, Bank, Police, Defence, Teaching jobs — all states', color: '#E65100' },
            { icon: '🎓', title: 'Education', desc: 'CBSE, NEET, JEE, UPSC exam news, results, admit cards, scholarships', color: '#283593' },
          ].map(item => (
            <div key={item.title} style={{ background: 'white', borderRadius: 10, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `3px solid ${item.color}` }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{item.icon}</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: '#0D1B2A', marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: '40px 48px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: '#0D1B2A', marginBottom: 16 }}>Our Content Policy</h2>
          <div style={{ fontSize: 14, color: '#444', lineHeight: 1.9 }}>
            <p style={{ marginBottom: 12 }}>NewsFlash aggregates news headlines from Google News RSS feeds and links directly to original source websites. We do not reproduce full articles or claim ownership of third-party content.</p>
            <p style={{ marginBottom: 12 }}>Original articles published on NewsFlash are written by our editorial team and are our intellectual property.</p>
            <p style={{ marginBottom: 12 }}>If you are a content owner and wish to have content removed, please email us at <a href="mailto:65arunyadav65@gmail.com" style={{ color: '#C62828' }}>65arunyadav65@gmail.com</a> and we will act promptly.</p>
            <p>Cricket data is sourced from CricketData.org API. Government job information is sourced from official notifications and provided as a public service.</p>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: '40px 48px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: '#0D1B2A', marginBottom: 16 }}>Contact Us</h2>
          <p style={{ fontSize: 15, color: '#444', lineHeight: 1.9, marginBottom: 20 }}>
            Have a news tip, feedback, partnership inquiry, or content removal request? We'd love to hear from you.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/contact" style={{ background: '#C62828', color: 'white', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Contact Us →
            </Link>
            <a href="mailto:65arunyadav65@gmail.com" style={{ background: '#F0F0EC', color: '#0D1B2A', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              📧 65arunyadav65@gmail.com
            </a>
          </div>
        </div>
      </main>

      <footer style={{ background: '#0D1B2A', color: '#4A6080', padding: '20px', textAlign: 'center', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', marginTop: 40 }}>
        <Link href="/" style={{ color: '#6A8099', textDecoration: 'none' }}>← Back to NewsFlash</Link>
        <span style={{ margin: '0 12px' }}>·</span>
        <Link href="/privacy-policy" style={{ color: '#6A8099', textDecoration: 'none' }}>Privacy Policy</Link>
        <span style={{ margin: '0 12px' }}>·</span>
        <Link href="/terms" style={{ color: '#6A8099', textDecoration: 'none' }}>Terms of Service</Link>
        <span style={{ margin: '0 12px' }}>·</span>
        © {new Date().getFullYear()} NewsFlash Media
      </footer>
    </div>
  )
}
