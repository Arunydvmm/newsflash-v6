// @ts-nocheck
import Link from 'next/link'
import { connectDB } from './lib/db'
import Article from './models/Article'
import { LoadingBar, WelcomePopup, HeroSlider, ArticleCard, CategoryButton, Skeleton, CATEGORIES, DarkModeToggle } from './components/HomeClient'
import { format } from 'date-fns'

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

  const [articles, allPub, justIn] = await Promise.all([
    Article.find(query).sort({ createdAt: -1 }).limit(18).lean(),
    Article.find({ status: 'published' }).sort({ createdAt: -1 }).limit(24).lean(),
    Article.find({ status: 'published' }).sort({ createdAt: -1 }).limit(4).lean(),
  ])

  const slider   = allPub.filter((a: any) => a.featuredImage).slice(0, 5)
  const featured = articles.slice(0, 3)
  const rest     = articles.slice(3, 12)
  const trending = [...allPub].sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 6)
  const ticker   = (allPub.filter((a: any) => a.isBreaking).concat(allPub)).slice(0, 8).map((a: any) => a.title)

  // Category sections
  const catSections = ['India', 'Sports', 'Technology', 'Education', 'Business'].map(cat => ({
    cat,
    articles: allPub.filter((a: any) => a.category === cat).slice(0, 4),
  })).filter(s => s.articles.length > 0)

  const fmt = (d: any) => format(new Date(d), 'd MMM yyyy')

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      <LoadingBar />
      <WelcomePopup />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes shimmerBar{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes justIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        .footer-link{font-size:12px;padding-bottom:8px;color:#6A8099;text-decoration:none;display:block;transition:color 0.2s}
        .footer-link:hover{color:#D4A017}
        .sec-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#0D1B2A;display:flex;align-items:center;gap:10px;margin-bottom:16px}
        .sec-title::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,#E5E7EB,transparent)}
        @media(max-width:900px){
          .main-grid{grid-template-columns:1fr!important}
          .sidebar{display:none!important}
          .feat-grid{grid-template-columns:1fr 1fr!important}
          .rest-grid{grid-template-columns:1fr 1fr!important}
          .cat-sec-grid{grid-template-columns:1fr 1fr!important}
          .footer-grid{grid-template-columns:1fr 1fr!important;gap:24px!important}
          .logo{font-size:26px!important}
        }
        @media(max-width:540px){
          .feat-grid{grid-template-columns:1fr!important}
          .rest-grid{grid-template-columns:1fr!important}
          .cat-sec-grid{grid-template-columns:1fr!important}
          .footer-grid{grid-template-columns:1fr!important}
          .portal-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ background: '#0D1B2A', color: '#4A6080', fontSize: 11, padding: '6px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
        <span style={{ color: '#6A8099' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · IST</span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {['India','World','Business','Tech','Sports'].map(c => (
            <Link key={c} href={`/?category=${c}`} style={{ color: '#4A6080', textDecoration: 'none', fontSize: 11, transition: 'color 0.2s' }}>{c}</Link>
          ))}
        </div>
      </div>

      {/* ── HEADER ── */}
      <header style={{ background: 'white', borderBottom: '3px solid #0D1B2A', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', gap: 12, flexWrap: 'wrap' }}>
            {/* Logo */}
            <Link href="/" className="logo" style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 900, color: '#0D1B2A', textDecoration: 'none', letterSpacing: -1, display: 'flex', alignItems: 'baseline', gap: 0 }}>
              NEWS<span style={{ color: '#C62828' }}>FLASH</span>
              <span style={{ width: 6, height: 6, background: '#D4A017', borderRadius: '50%', display: 'inline-block', marginLeft: 3, marginBottom: 6 }} />
            </Link>
            {/* Right */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <form action="/" method="get" style={{ display: 'flex', border: '1.5px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <input name="search" defaultValue={search} placeholder="Search news..." style={{ border: 'none', background: '#FAFAF8', padding: '8px 14px', fontSize: 13, width: 190, outline: 'none', fontFamily: 'Inter, sans-serif' }} />
                <button type="submit" style={{ background: '#0D1B2A', color: 'white', border: 'none', padding: '8px 14px', cursor: 'pointer', fontSize: 14 }}>🔍</button>
              </form>
              <DarkModeToggle />
              <Link href="/staff" style={{ background: '#EEF2FF', color: '#3730A3', padding: '8px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1, textDecoration: 'none', borderRadius: 8, textTransform: 'uppercase', whiteSpace: 'nowrap', border: '1px solid #C7D2FE', fontWeight: 600 }}>Staff</Link>
              <Link href="/admin" style={{ background: 'linear-gradient(135deg,#C62828,#B71C1C)', color: 'white', padding: '8px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1, textDecoration: 'none', borderRadius: 8, textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(198,40,40,0.35)', fontWeight: 600 }}>⚙ Admin</Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── CATEGORY BUTTONS NAV ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 20px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', alignItems: 'center' }}>
          {/* All button */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 24, border: `1.5px solid ${!category ? '#0D1B2A' : '#E5E7EB'}`, background: !category ? '#0D1B2A' : 'white', color: !category ? 'white' : '#555', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: !category ? 700 : 500, transition: 'all 0.2s', boxShadow: !category ? '0 4px 14px rgba(13,27,42,0.3)' : 'none', cursor: 'pointer' }}>
              📰 All
            </div>
          </Link>
          {CATEGORIES.map(cat => (
            <CategoryButton key={cat.label} cat={cat} active={category === cat.label} />
          ))}
          {/* Special portals */}
          <Link href="/cricket" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 24, border: '1.5px solid #1B5E20', background: '#E8F5E9', color: '#1B5E20', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🏏 Cricket Live
            </div>
          </Link>
          <Link href="/sarkari" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 24, border: '1.5px solid #E65100', background: '#FFF3E0', color: '#E65100', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🏛 Sarkari Naukri
            </div>
          </Link>
        </div>
      </div>

      {/* ── BREAKING TICKER ── */}
      <div style={{ display: 'flex', overflow: 'hidden', alignItems: 'center', background: 'linear-gradient(90deg,#C62828,#B71C1C)' }}>
        <div style={{ background: '#7B1919', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', padding: '9px 16px', whiteSpace: 'nowrap', flexShrink: 0, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, background: 'white', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
          Breaking
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ animation: 'ticker 50s linear infinite', display: 'flex', gap: 48, whiteSpace: 'nowrap', padding: '9px 20px', fontSize: 13, color: 'white' }}>
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i}>{t}{i < ticker.length * 2 - 1 && <span style={{ opacity: 0.35, margin: '0 20px' }}>·</span>}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── SEARCH RESULT HEADER ── */}
      {(search || category) && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 20px 0', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6B7280' }}>
          {search && <span>Results for "<strong style={{ color: '#0D1B2A' }}>{search}</strong>" — {articles.length} found · <Link href="/" style={{ color: '#C62828' }}>Clear ×</Link></span>}
          {category && !search && <span>Category: <strong style={{ color: '#0D1B2A' }}>{category}</strong> — {articles.length} articles · <Link href="/" style={{ color: '#C62828' }}>All ×</Link></span>}
        </div>
      )}

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📰</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#0D1B2A', marginBottom: 8 }}>No articles found</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#aaa', marginBottom: 20 }}>{search ? `No results for "${search}"` : `No articles in ${category} yet`}</div>
            <Link href="/" style={{ background: '#C62828', color: 'white', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Back to Home</Link>
          </div>
        ) : (
          <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }}>

            {/* ── LEFT ── */}
            <div>
              {/* Just In */}
              {!search && !category && justIn.length > 0 && (
                <div style={{ background: 'white', borderRadius: 12, padding: '14px 18px', marginBottom: 24, border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 8, height: 8, background: '#C62828', borderRadius: '50%', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#C62828', fontWeight: 700 }}>Just In</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#aaa', marginLeft: 'auto' }}>Latest updates</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
                    {justIn.map((a: any, i: number) => {
                      const cat = CATEGORIES.find(c => c.label === a.category)
                      return (
                        <Link key={String(a._id)} href={`/article/${a.slug}`} style={{ textDecoration: 'none', flexShrink: 0, width: 200 }}>
                          <div style={{ background: '#F8F8F6', borderRadius: 8, padding: '10px 12px', animation: `justIn 0.4s ease ${i * 0.1}s both`, border: '1px solid #F0F0EC' }}>
                            {cat && <span style={{ background: cat.bg, color: cat.color, fontFamily: 'JetBrains Mono, monospace', fontSize: 8, padding: '2px 6px', borderRadius: 3, display: 'inline-block', marginBottom: 6 }}>{cat.icon} {cat.label}</span>}
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#0D1B2A', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</div>
                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#aaa', marginTop: 6 }}>{fmt(a.createdAt)}</div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Hero Slider */}
              {!search && !category && slider.length > 0 && <HeroSlider articles={slider} />}

              {/* Portal Cards */}
              {!search && !category && (
                <div className="portal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
                  {[
                    { label: 'Cricket Live', icon: '🏏', desc: 'IPL scores · Points Table · Orange & Purple Cap', href: '/cricket', color: '#1B5E20', bg: 'linear-gradient(135deg,#1B5E20,#2E7D32)', light: '#E8F5E9' },
                    { label: 'Sarkari Naukri', icon: '🏛', desc: 'Railway · SSC · UPSC · Bank · Police jobs 2026', href: '/sarkari', color: '#E65100', bg: 'linear-gradient(135deg,#E65100,#F57C00)', light: '#FFF3E0' },
                  ].map(p => (
                    <Link key={p.href} href={p.href} style={{ textDecoration: 'none' }}>
                      <div style={{ background: p.bg, borderRadius: 12, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', transition: 'all 0.25s', cursor: 'pointer', color: 'white' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 32px rgba(0,0,0,0.2)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)' }}>
                        <span style={{ fontSize: 38 }}>{p.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.label}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{p.desc}</div>
                        </div>
                        <span style={{ fontSize: 22, opacity: 0.8 }}>→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Featured Articles */}
              <div style={{ marginBottom: 8 }}>
                <h2 className="sec-title">
                  <span style={{ width: 4, height: 20, background: 'linear-gradient(180deg,#C62828,#D4A017)', borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
                  {category ? `${category} News` : search ? 'Search Results' : 'Latest News'}
                </h2>
              </div>
              <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
                {featured.map((a: any) => <ArticleCard key={String(a._id)} a={a} />)}
              </div>

              {/* More Stories */}
              {rest.length > 0 && (
                <>
                  <h2 className="sec-title" style={{ marginBottom: 16 }}>
                    <span style={{ width: 4, height: 20, background: 'linear-gradient(180deg,#0D1B2A,#1B2B3A)', borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
                    More Stories
                  </h2>
                  <div className="rest-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 40 }}>
                    {rest.map((a: any) => <ArticleCard key={String(a._id)} a={a} size="sm" />)}
                  </div>
                </>
              )}

              {/* Category Sections */}
              {!search && !category && catSections.map(({ cat, articles: catArts }) => {
                const catData = CATEGORIES.find(c => c.label === cat)
                return (
                  <div key={cat} style={{ marginBottom: 40 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h2 className="sec-title" style={{ margin: 0, flex: 1 }}>
                        <span style={{ width: 4, height: 20, background: catData?.color || '#888', borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
                        {catData?.icon} {cat}
                      </h2>
                      <Link href={`/?category=${cat}`} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: catData?.color || '#888', textDecoration: 'none', letterSpacing: 1, flexShrink: 0, marginLeft: 12 }}>View All →</Link>
                    </div>
                    <div className="cat-sec-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
                      {catArts.map((a: any) => <ArticleCard key={String(a._id)} a={a} size="sm" />)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── SIDEBAR ── */}
            <aside className="sidebar">
              {/* Ad */}
              <div style={{ background: '#F0EFE8', border: '1px dashed #E0DDD5', height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#ccc', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24, borderRadius: 10 }}>300 × 250 Ad</div>

              {/* Trending */}
              {trending.length > 0 && (
                <div style={{ background: 'white', borderRadius: 12, padding: '18px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20, border: '1px solid #E5E7EB' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#0D1B2A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    🔥 Trending Now
                  </h3>
                  {trending.map((a: any, i: number) => (
                    <Link key={String(a._id)} href={`/article/${a.slug}`} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < trending.length - 1 ? '1px solid #F0F0EC' : 'none', textDecoration: 'none', color: 'inherit', alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 900, color: i < 3 ? '#C62828' : '#E8E8E4', lineHeight: 1, width: 26, flexShrink: 0 }}>{i + 1}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, color: '#0D1B2A' }}>{a.title}</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#aaa', marginTop: 4 }}>{(a.views || 0).toLocaleString('en-IN')} reads</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Quick Links */}
              <div style={{ background: 'white', borderRadius: 12, padding: '18px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20, border: '1px solid #E5E7EB' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#0D1B2A', marginBottom: 14 }}>Quick Links</h3>
                {[
                  { label: '🏏 Cricket Live Scores', href: '/cricket', color: '#1B5E20' },
                  { label: '🏛 Sarkari Naukri 2026', href: '/sarkari', color: '#E65100' },
                  { label: '🎓 Education News', href: '/?category=Education', color: '#283593' },
                  { label: '📧 Contact Us', href: '/contact', color: '#1565C0' },
                  { label: 'ℹ About NewsFlash', href: '/about', color: '#888' },
                ].map(l => (
                  <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #F0F0EC', textDecoration: 'none', fontSize: 13, color: l.color, fontWeight: 500 }}>
                    {l.label} <span style={{ opacity: 0.5 }}>→</span>
                  </Link>
                ))}
              </div>

              {/* Ad 2 */}
              <div style={{ background: '#F0EFE8', border: '1px dashed #E0DDD5', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#ccc', textTransform: 'uppercase', letterSpacing: 2, borderRadius: 10 }}>300 × 200 Ad</div>
            </aside>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0D1B2A', color: '#4A6080', marginTop: 56 }}>
        {/* Gold top line */}
        <div style={{ height: 3, background: 'linear-gradient(90deg,#C62828,#D4A017,#0D1B2A)' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 20px 32px' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 36 }}>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, fontWeight: 900, color: 'white', marginBottom: 6 }}>
                NEWS<span style={{ color: '#C62828' }}>FLASH</span><span style={{ width: 6, height: 6, background: '#D4A017', borderRadius: '50%', display: 'inline-block', marginLeft: 3, marginBottom: 4 }} />
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#2C3E50', textTransform: 'uppercase', marginBottom: 16 }}>India's Fastest News Platform</div>
              <div style={{ width: 48, height: 2, background: 'linear-gradient(90deg,#C62828,#D4A017)', borderRadius: 1, marginBottom: 16 }} />
              <p style={{ fontSize: 13, lineHeight: 1.9, color: '#6A8099', marginBottom: 16 }}>India's trusted digital newsroom — breaking news, IPL live scores, Sarkari Naukri, cricket analytics and education updates. Updated 24/7.</p>
              <a href="mailto:65arunyadav65@gmail.com" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#4A6080', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>📧 65arunyadav65@gmail.com</a>
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#D4A017', marginBottom: 16, fontWeight: 700 }}>Sections</div>
              {['India','World','Business','Technology','Sports','Science','Health','Entertainment','Education'].map(c => (
                <Link key={c} href={`/?category=${c}`} className="footer-link">{c}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#D4A017', marginBottom: 16, fontWeight: 700 }}>Portals</div>
              <Link href="/cricket" className="footer-link">🏏 Cricket Live</Link>
              <Link href="/sarkari" className="footer-link">🏛 Sarkari Naukri</Link>
              <Link href="/?category=Education" className="footer-link">🎓 Education</Link>
              <Link href="/staff" className="footer-link">👥 Staff Login</Link>
              <Link href="/admin" className="footer-link">⚙ Admin Panel</Link>
              <Link href="/sitemap.xml" className="footer-link">🗺 Sitemap</Link>
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#D4A017', marginBottom: 16, fontWeight: 700 }}>Company</div>
              <Link href="/about" className="footer-link">About Us</Link>
              <Link href="/contact" className="footer-link">Contact Us</Link>
              <Link href="/privacy-policy" className="footer-link">Privacy Policy</Link>
              <Link href="/terms" className="footer-link">Terms of Service</Link>
              <a href="mailto:65arunyadav65@gmail.com" className="footer-link">Advertise With Us</a>
              <a href="mailto:65arunyadav65@gmail.com?subject=News Tip" className="footer-link">Submit News Tip</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1B2B3A' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#2C3E50', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span>© {new Date().getFullYear()} NewsFlash Media. All rights reserved. · India</span>
            <span style={{ display: 'flex', gap: 12 }}>
              {[['Privacy','/privacy-policy'],['Terms','/terms'],['About','/about'],['Contact','/contact']].map(([l,h]) => (
                <Link key={l} href={h} style={{ color: '#2C3E50', textDecoration: 'none' }}>{l}</Link>
              ))}
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
