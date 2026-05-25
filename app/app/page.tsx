// @ts-nocheck
import Link from 'next/link'
import { connectDB } from './lib/db'
import Article from './models/Article'
import { HeroSlider, ArticleCard, PortalCards, WelcomePopup, LoadingBar, SkeletonCard } from './components/HomeClient'

export const revalidate = 60

export default async function HomePage({ searchParams }: any) {
  await connectDB()

  const category = searchParams?.category || ''
  const search   = searchParams?.search   || ''

  const query: any = { status: 'published' }
  if (category) query.category = category
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { summary: { $regex: search, $options: 'i' } },
    { tags: { $regex: search, $options: 'i' } },
  ]

  const articles    = await Article.find(query).sort({ createdAt: -1 }).limit(16).lean()
  const allPub      = await Article.find({ status: 'published' }).sort({ createdAt: -1 }).limit(20).lean()
  const breaking    = await Article.find({ status: 'published', isBreaking: true }).sort({ createdAt: -1 }).limit(6).lean()

  const sliderItems = articles.filter((a: any) => a.featuredImage).slice(0, 5)
  const featured    = articles.slice(0, 3)
  const rest        = articles.slice(3, 12)
  const trending    = [...allPub].sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 6)

  const tickerItems = (breaking.length > 0 ? breaking : allPub).slice(0, 8).map((a: any) => a.title)

  const CATS = ['India','World','Business','Technology','Sports','Science','Health','Entertainment','Opinion']

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      <LoadingBar />
      <WelcomePopup />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .nav-scroll{display:flex;overflow-x:auto;scrollbar-width:none}
        .nav-scroll::-webkit-scrollbar{display:none}
        .footer-link{font-size:12px;padding-bottom:7px;color:#888;text-decoration:none;display:block;transition:color 0.2s}
        .footer-link:hover{color:#C62828}
        .section-title{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#888;padding-bottom:10px;border-bottom:2px solid #1A1A1A;margin-bottom:16px;display:flex;align-items:center;gap:8px}
        @media(max-width:768px){
          .main-grid{grid-template-columns:1fr!important}
          .sidebar-col{display:none!important}
          .featured-grid{grid-template-columns:1fr 1fr!important}
          .rest-grid{grid-template-columns:1fr 1fr!important}
          .footer-grid{grid-template-columns:1fr 1fr!important;gap:20px!important}
          .logo{font-size:26px!important}
          .header-pad{padding:0 14px!important}
          .main-pad{padding:16px 14px!important}
          .portal-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:480px){
          .featured-grid{grid-template-columns:1fr!important}
          .rest-grid{grid-template-columns:1fr!important}
          .footer-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ background: '#0D1B2A', color: '#4A6080', fontSize: 11, padding: '6px 20px', display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace' }}>
        <span style={{ color: '#6A8099' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · IST</span>
        <div style={{ display: 'flex', gap: 16 }}>
          {['India','World','Business','Tech','Sports'].map(c => (
            <Link key={c} href={`/?category=${c}`} style={{ color: '#4A6080', textDecoration: 'none', transition: 'color 0.2s' }}>{c}</Link>
          ))}
        </div>
      </div>

      {/* ── HEADER ── */}
      <header style={{ background: 'white', borderBottom: '3px solid #1A1A1A', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }} className="header-pad">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 10px', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/" className="logo" style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, fontWeight: 900, color: '#1A1A1A', textDecoration: 'none', letterSpacing: -1 }}>
              NEWS<span style={{ color: '#C62828' }}>FLASH</span>
            </Link>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <form action="/" method="get" style={{ display: 'flex', border: '1.5px solid #E0DDD5', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <input name="search" defaultValue={search} placeholder="Search news..." style={{ border: 'none', background: '#FAFAF8', padding: '8px 14px', fontSize: 13, width: 180, outline: 'none', fontFamily: 'Inter, sans-serif' }} />
                <button type="submit" style={{ background: '#1A1A1A', color: 'white', border: 'none', padding: '8px 14px', cursor: 'pointer', fontSize: 14 }}>🔍</button>
              </form>
              <Link href="/staff" style={{ background: '#F0F4FF', color: '#1565C0', padding: '8px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1, textDecoration: 'none', borderRadius: 6, textTransform: 'uppercase', whiteSpace: 'nowrap', border: '1px solid #BBDEFB' }}>
                Staff
              </Link>
              <Link href="/admin" style={{ background: '#C62828', color: 'white', padding: '8px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1, textDecoration: 'none', borderRadius: 6, textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(198,40,40,0.3)' }}>
                ⚙ Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── NAV ── */}
      <nav style={{ background: 'white', borderBottom: '1px solid #E8E8E4', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div className="nav-scroll">
            {CATS.map(c => (
              <Link key={c} href={`/?category=${c}`} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', padding: '11px 14px', color: category === c ? '#C62828' : '#6B6B6B', textDecoration: 'none', whiteSpace: 'nowrap', borderBottom: category === c ? '3px solid #C62828' : '3px solid transparent', flexShrink: 0, transition: 'all 0.2s', fontWeight: category === c ? 700 : 400 }}>
                {c}
              </Link>
            ))}
            <Link href="/cricket" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', padding: '11px 14px', color: '#1B5E20', textDecoration: 'none', whiteSpace: 'nowrap', borderBottom: '3px solid transparent', flexShrink: 0, fontWeight: 700 }}>
              🏏 Cricket Live
            </Link>
            <Link href="/sarkari" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', padding: '11px 14px', color: '#E65100', textDecoration: 'none', whiteSpace: 'nowrap', borderBottom: '3px solid transparent', flexShrink: 0, fontWeight: 700 }}>
              🏛 Sarkari Naukri
            </Link>
          </div>
        </div>
      </nav>

      {/* ── BREAKING TICKER ── */}
      <div style={{ display: 'flex', overflow: 'hidden', alignItems: 'center', background: 'linear-gradient(90deg,#C62828,#B71C1C)', color: 'white' }}>
        <div style={{ background: '#7B1919', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', padding: '9px 16px', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, background: 'white', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
          Breaking
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ animation: 'ticker 45s linear infinite', display: 'flex', gap: 48, whiteSpace: 'nowrap', padding: '9px 20px', fontSize: 13 }}>
            {[...tickerItems, ...tickerItems].map((t, i) => (
              <span key={i}>{t}{i < tickerItems.length * 2 - 1 && <span style={{ opacity: 0.4, margin: '0 20px' }}>·</span>}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── SEARCH RESULT HEADER ── */}
      {(search || category) && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 20px 0', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6B6B6B' }}>
          {search && <span>Results for "<strong>{search}</strong>" — {articles.length} found · <Link href="/" style={{ color: '#C62828' }}>Clear ×</Link></span>}
          {category && !search && <span>Category: <strong>{category}</strong> — {articles.length} articles · <Link href="/" style={{ color: '#C62828' }}>All ×</Link></span>}
        </div>
      )}

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }} className="main-pad">
        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 12 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#aaa', letterSpacing: 1 }}>No articles found{search ? ` for "${search}"` : ''}.</div>
            <Link href="/" style={{ display: 'inline-block', marginTop: 16, color: '#C62828', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>← Back to Home</Link>
          </div>
        ) : (
          <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }}>

            {/* ── LEFT COLUMN ── */}
            <div>
              {/* Hero Slider */}
              {!search && !category && sliderItems.length > 0 && <HeroSlider articles={sliderItems} />}

              {/* Portal Cards */}
              {!search && !category && (
                <div className="portal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
                  {[
                    { label: 'Cricket Live', icon: '🏏', desc: 'IPL scores & match updates', href: '/cricket', color: '#1B5E20', bg: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)' },
                    { label: 'Sarkari Naukri', icon: '🏛', desc: 'Latest government jobs 2026', href: '/sarkari', color: '#E65100', bg: 'linear-gradient(135deg,#FFF3E0,#FFE0B2)' },
                  ].map(p => (
                    <Link key={p.href} href={p.href} style={{ textDecoration: 'none' }}>
                      <div style={{ background: p.bg, borderRadius: 10, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.2s', cursor: 'pointer' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <span style={{ fontSize: 34 }}>{p.icon}</span>
                        <div>
                          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: p.color }}>{p.label}</div>
                          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{p.desc}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', color: p.color, fontSize: 20, fontWeight: 700 }}>→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Featured Grid */}
              <div style={{ marginBottom: 8 }}>
                <div className="section-title">
                  <span style={{ width: 3, height: 14, background: '#C62828', borderRadius: 2, display: 'inline-block' }} />
                  {category ? `${category} News` : search ? 'Search Results' : 'Latest News'}
                </div>
              </div>
              <div className="featured-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
                {featured.map((a: any) => <ArticleCard key={String(a._id)} a={a} />)}
              </div>

              {/* Rest Grid */}
              {rest.length > 0 && (
                <>
                  <div className="section-title" style={{ marginTop: 8 }}>
                    <span style={{ width: 3, height: 14, background: '#0D1B2A', borderRadius: 2, display: 'inline-block' }} />
                    More Stories
                  </div>
                  <div className="rest-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    {rest.map((a: any) => <ArticleCard key={String(a._id)} a={a} size="sm" />)}
                  </div>
                </>
              )}
            </div>

            {/* ── SIDEBAR ── */}
            <aside className="sidebar-col">
              {/* Ad */}
              <div style={{ background: '#F0EFE8', border: '1px dashed #E0DDD5', height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#ccc', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24, borderRadius: 8 }}>
                300 × 250 Ad
              </div>

              {/* Trending */}
              {trending.length > 0 && (
                <div style={{ background: 'white', borderRadius: 10, padding: '18px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
                  <div className="section-title">
                    <span style={{ width: 3, height: 14, background: '#C62828', borderRadius: 2, display: 'inline-block' }} />
                    🔥 Trending
                  </div>
                  {trending.map((a: any, i: number) => (
                    <Link key={String(a._id)} href={`/article/${a.slug}`} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < trending.length - 1 ? '1px solid #F0F0EC' : 'none', textDecoration: 'none', color: 'inherit', alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: '#E8E8E4', lineHeight: 1, width: 28, flexShrink: 0 }}>{i + 1}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, color: '#1A1A1A' }}>{a.title}</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#aaa', marginTop: 4 }}>{(a.views || 0).toLocaleString('en-IN')} reads</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Quick Links */}
              <div style={{ background: 'white', borderRadius: 10, padding: '18px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="section-title">
                  <span style={{ width: 3, height: 14, background: '#0D1B2A', borderRadius: 2, display: 'inline-block' }} />
                  Quick Links
                </div>
                {[
                  { label: '🏏 Cricket Live Scores', href: '/cricket', color: '#1B5E20' },
                  { label: '🏛 Sarkari Naukri', href: '/sarkari', color: '#E65100' },
                  { label: '📧 Contact Us', href: '/contact', color: '#1565C0' },
                  { label: 'ℹ About NewsFlash', href: '/about', color: '#888' },
                ].map(l => (
                  <Link key={l.href} href={l.href} style={{ display: 'block', padding: '9px 0', borderBottom: '1px solid #F0F0EC', textDecoration: 'none', fontSize: 13, color: l.color, fontWeight: 500 }}>{l.label}</Link>
                ))}
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0D1B2A', color: '#4A6080', marginTop: 56 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 32 }}>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 10 }}>
                NEWS<span style={{ color: '#C62828' }}>FLASH</span>
              </div>
              <div style={{ width: 40, height: 3, background: 'linear-gradient(90deg,#C62828,#D4A017)', borderRadius: 2, marginBottom: 14 }} />
              <p style={{ fontSize: 13, lineHeight: 1.8, marginBottom: 14, color: '#6A8099' }}>India's trusted digital newsroom — breaking news, IPL live scores, Sarkari Naukri and cricket analytics. Updated 24/7.</p>
              <a href="mailto:65arunyadav65@gmail.com" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#4A6080', textDecoration: 'none' }}>📧 65arunyadav65@gmail.com</a>
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'white', marginBottom: 14 }}>Sections</div>
              {['India','World','Business','Technology','Sports','Science','Health'].map(c => (
                <Link key={c} href={`/?category=${c}`} className="footer-link">{c}</Link>
              ))}
              <Link href="/cricket" className="footer-link">🏏 Cricket Live</Link>
              <Link href="/sarkari" className="footer-link">🏛 Sarkari Naukri</Link>
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'white', marginBottom: 14 }}>Company</div>
              <Link href="/about" className="footer-link">About Us</Link>
              <Link href="/contact" className="footer-link">Contact Us</Link>
              <Link href="/privacy-policy" className="footer-link">Privacy Policy</Link>
              <Link href="/terms" className="footer-link">Terms of Service</Link>
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'white', marginBottom: 14 }}>Portals</div>
              <Link href="/staff" className="footer-link">Staff Login</Link>
              <Link href="/admin" className="footer-link">Admin Panel</Link>
              <Link href="/sitemap.xml" className="footer-link">Sitemap</Link>
              <a href="mailto:65arunyadav65@gmail.com" className="footer-link">Advertise</a>
              <a href="mailto:65arunyadav65@gmail.com?subject=News Tip" className="footer-link">Submit News Tip</a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px', borderTop: '1px solid #1B2B3A', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#2C3E50', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span>© {new Date().getFullYear()} NewsFlash Media. All rights reserved. · India</span>
          <span>
            <Link href="/privacy-policy" style={{ color: '#2C3E50', textDecoration: 'none' }}>Privacy</Link>
            {' · '}
            <Link href="/terms" style={{ color: '#2C3E50', textDecoration: 'none' }}>Terms</Link>
            {' · '}
            <Link href="/about" style={{ color: '#2C3E50', textDecoration: 'none' }}>About</Link>
          </span>
        </div>
      </footer>
    </div>
  )
}
