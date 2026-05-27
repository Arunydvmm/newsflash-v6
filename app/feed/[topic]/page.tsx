// @ts-nocheck
import { connectDB } from '../../lib/db'
import Article from '../../models/Article'
import Link from 'next/link'
import { format } from 'date-fns'
import { CATEGORIES } from '../../lib/categories'
import type { Metadata } from 'next'
import NewsFeedWidget from '../../components/NewsFeedWidget'

export const revalidate = 120

const TOPIC_META: Record<string, { title: string; desc: string; icon: string; color: string; category: string }> = {
  education: {
    title: 'Education News 2026',
    desc: 'Latest education news — board results, university admissions, scholarships, NEET, JEE, CUET and more.',
    icon: '🎓',
    color: '#283593',
    category: 'Education',
  },
  sports: {
    title: 'Sports News',
    desc: 'Latest sports news — cricket, football, kabaddi, athletics and more.',
    icon: '🏆',
    color: '#1B5E20',
    category: 'Sports',
  },
  technology: {
    title: 'Technology News',
    desc: 'Latest tech news — AI, startups, gadgets, apps and more.',
    icon: '💻',
    color: '#0D47A1',
    category: 'Technology',
  },
  business: {
    title: 'Business & Economy',
    desc: 'Latest business news — markets, startups, economy and more.',
    icon: '📈',
    color: '#E65100',
    category: 'Business',
  },
  india: {
    title: 'India News',
    desc: 'Latest news from India — politics, society, government and more.',
    icon: '🇮🇳',
    color: '#C62828',
    category: 'India',
  },
  world: {
    title: 'World News',
    desc: 'Latest international news from around the world.',
    icon: '🌍',
    color: '#1565C0',
    category: 'World',
  },
  health: {
    title: 'Health & Wellness',
    desc: 'Latest health news — medicine, fitness, mental health and more.',
    icon: '🏥',
    color: '#2E7D32',
    category: 'Health',
  },
  science: {
    title: 'Science & Research',
    desc: 'Latest science news — space, research, discoveries and more.',
    icon: '🔬',
    color: '#6A1B9A',
    category: 'Science',
  },
  entertainment: {
    title: 'Entertainment News',
    desc: 'Latest entertainment news — Bollywood, OTT, music and more.',
    icon: '🎬',
    color: '#AD1457',
    category: 'Entertainment',
  },
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const meta = TOPIC_META[params.topic?.toLowerCase()] || {
    title: `${params.topic} News`,
    desc: `Latest ${params.topic} news on NewsFlash`,
    icon: '📰',
    color: '#0D1B2A',
    category: params.topic,
  }
  return {
    title: `${meta.title} — NewsFlash`,
    description: meta.desc,
  }
}

export default async function FeedPage({ params, searchParams }: any) {
  const topicSlug = params.topic?.toLowerCase() || ''
  const meta = TOPIC_META[topicSlug] || {
    title: `${params.topic} News`,
    desc: `Latest ${params.topic} news`,
    icon: '📰',
    color: '#0D1B2A',
    category: params.topic,
  }

  const page   = parseInt(searchParams?.page || '1', 10)
  const limit  = 18
  const skip   = (page - 1) * limit
  const search = searchParams?.search || ''

  await connectDB()

  const q: any = { status: 'published', category: { $regex: new RegExp(`^${meta.category}$`, 'i') } }
  if (search) q.$or = [
    { title:   { $regex: search, $options: 'i' } },
    { summary: { $regex: search, $options: 'i' } },
  ]

  const [articles, total] = await Promise.all([
    Article.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Article.countDocuments(q),
  ])

  const totalPages = Math.ceil(total / limit)
  const fmt = (d: any) => format(new Date(d), 'd MMM yyyy')

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      <style>{`
        * { box-sizing: border-box; }
        .art-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; }
        @media (max-width: 640px) { .art-grid { grid-template-columns: 1fr; } }
        .art-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .art-card { transition: all 0.2s; }
      `}</style>

      {/* Header */}
      <header style={{ background: `linear-gradient(135deg, ${meta.color} 0%, #0D1B2A 100%)`, color: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← NewsFlash</Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, fontWeight: 900, margin: 0 }}>
                {meta.icon} {meta.title}
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>{meta.desc}</p>
            </div>
            <form action={`/feed/${topicSlug}`} method="get" style={{ display: 'flex', gap: 8 }}>
              <input name="search" defaultValue={search} placeholder={`Search ${meta.category}...`}
                style={{ padding: '8px 14px', border: 'none', borderRadius: 4, fontSize: 13, outline: 'none', width: 200 }} />
              <button type="submit" style={{ background: '#C62828', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>🔍</button>
            </form>
          </div>
        </div>
      </header>

      {/* Quick category links */}
      <div style={{ background: '#0D1B2A', borderBottom: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', padding: '0 20px', maxWidth: 1200, margin: '0 auto' }}>
          {Object.entries(TOPIC_META).map(([slug, t]) => (
            <Link key={slug} href={`/feed/${slug}`}
              style={{ padding: '10px 14px', color: slug === topicSlug ? 'white' : 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', borderBottom: slug === topicSlug ? `3px solid ${meta.color}` : '3px solid transparent', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {t.icon} {t.category}
            </Link>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        {/* Result count */}
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#888', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {search ? `Results for "${search}"` : `${meta.category} News`} — {total} articles
            {search && <Link href={`/feed/${topicSlug}`} style={{ color: '#C62828', marginLeft: 10, textDecoration: 'none' }}>Clear ×</Link>}
          </span>
          {totalPages > 1 && <span>Page {page} of {totalPages}</span>}
        </div>

        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 12 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>{meta.icon}</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#0D1B2A', marginBottom: 8 }}>
              No articles found
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#aaa', marginBottom: 20 }}>
              {search ? `No results for "${search}"` : `No ${meta.category} articles published yet`}
            </div>
            <Link href="/" style={{ background: '#C62828', color: 'white', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              ← Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="art-grid">
              {articles.map((a: any) => {
                const catData = CATEGORIES.find((c: any) => c.label === a.category)
                return (
                  <Link key={String(a._id)} href={`/article/${a.slug}`} className="art-card"
                    style={{ background: 'white', borderRadius: 10, overflow: 'hidden', textDecoration: 'none', border: '1px solid #E8E8E4', display: 'block' }}>
                    {a.featuredImage && (
                      <div style={{ height: 180, overflow: 'hidden' }}>
                        <img src={a.featuredImage} alt={a.title} loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                      </div>
                    )}
                    <div style={{ padding: '14px 16px' }}>
                      {catData && (
                        <span style={{ background: catData.color, color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, padding: '2px 8px', borderRadius: 3, display: 'inline-block', marginBottom: 8, letterSpacing: 0.5 }}>
                          {catData.icon} {catData.label}
                        </span>
                      )}
                      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#0D1B2A', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {a.title}
                      </h2>
                      {a.summary && (
                        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.55, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {a.summary}
                        </p>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#aaa' }}>
                          {fmt(a.createdAt)}
                        </span>
                        {a.views > 0 && (
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#aaa' }}>
                            {a.views.toLocaleString('en-IN')} reads
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                {page > 1 && (
                  <Link href={`/feed/${topicSlug}?page=${page - 1}${search ? `&search=${search}` : ''}`}
                    style={{ padding: '9px 18px', background: 'white', border: '1px solid #E8E8E4', borderRadius: 6, textDecoration: 'none', fontSize: 13, color: '#0D1B2A', fontFamily: 'JetBrains Mono, monospace' }}>
                    ← Prev
                  </Link>
                )}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  return (
                    <Link key={p} href={`/feed/${topicSlug}?page=${p}${search ? `&search=${search}` : ''}`}
                      style={{ padding: '9px 14px', background: p === page ? meta.color : 'white', border: `1px solid ${p === page ? meta.color : '#E8E8E4'}`, borderRadius: 6, textDecoration: 'none', fontSize: 13, color: p === page ? 'white' : '#0D1B2A', fontFamily: 'JetBrains Mono, monospace' }}>
                      {p}
                    </Link>
                  )
                })}
                {page < totalPages && (
                  <Link href={`/feed/${topicSlug}?page=${page + 1}${search ? `&search=${search}` : ''}`}
                    style={{ padding: '9px 18px', background: 'white', border: '1px solid #E8E8E4', borderRadius: 6, textDecoration: 'none', fontSize: 13, color: '#0D1B2A', fontFamily: 'JetBrains Mono, monospace' }}>
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        {/* Related feed */}
        <div style={{ marginTop: 40 }}>
          <NewsFeedWidget topic={topicSlug} limit={8} />
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0D1B2A', color: 'rgba(255,255,255,0.4)', marginTop: 48, padding: '20px', textAlign: 'center', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>← Back to NewsFlash</Link>
        <span style={{ margin: '0 12px' }}>·</span>
        © {new Date().getFullYear()} NewsFlash Media
      </footer>
    </div>
  )
}
