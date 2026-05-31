// @ts-nocheck
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { connectDB } from '../../lib/db'
import Article from '../../models/Article'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import AdSlotServer from '../../components/AdSlotServer'
import ArticleRenderer from '@/components/article/ArticleRenderer'
import TableOfContents from '@/components/article/TableOfContents'

export const revalidate = 0 // Disable ISR - fetch fresh data on every request

const SITE_URL = 'https://newsflash-v6.onrender.com'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB()
  const a = await Article.findOne({ slug: params.slug, status: 'published' }).lean() as any
  if (!a) return { title: 'Not Found' }
  const url = `${SITE_URL}/article/${a.slug}`
  const image = a.coverImage || a.featuredImage || `${SITE_URL}/og-default.jpg`
  const title = a.metaTitle || a.title
  const description = a.excerpt || a.summary
  return {
    title,
    description,
    keywords: [...(a.tags || []), a.category, 'India news', 'NewsFlash'],
    authors: [{ name: a.author || 'NewsFlash Editorial' }],
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      publishedTime: a.createdAt,
      modifiedTime: a.updatedAt,
      authors: [a.author || 'NewsFlash Editorial'],
      section: a.category,
      tags: a.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : null
    }
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}?rel=0`
    }
  } catch {}
  return null
}

export default async function ArticlePage({ params }: Props) {
  await connectDB()
  const a = await Article.findOne({ slug: params.slug, status: 'published' }).lean() as any
  if (!a) notFound()

  await Article.findByIdAndUpdate(a._id, { $inc: { views: 1 } })

  const related = await Article.find({
    status: 'published', category: a.category, _id: { $ne: a._id }
  }).sort({ createdAt: -1 }).limit(3).lean() as any[]

  const fmt = (d: any) => format(new Date(d), 'd MMM yyyy')
  const embedUrl = a.videoUrl ? getEmbedUrl(a.videoUrl) : null

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: a.title,
    description: a.summary,
    image: a.featuredImage ? [a.featuredImage] : [],
    datePublished: a.createdAt,
    dateModified: a.updatedAt || a.createdAt,
    author: [{ '@type': 'Person', name: a.author || 'NewsFlash Editorial' }],
    publisher: {
      '@type': 'Organization',
      name: 'NewsFlash',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/article/${a.slug}` },
    keywords: (a.tags || []).join(', '),
    articleSection: a.category,
    inLanguage: 'en-IN',
  }

  return (
    <div style={{ fontFamily:"'Inter', sans-serif", background:'#FFFFFF', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        .art-grid { display: grid; grid-template-columns: 1fr 320px; gap: 40px; max-width: 1200px; margin: 0 auto; padding: 48px 20px; }
        .rel-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        .art-title { font-size: 42px; font-weight: 800; line-height: 1.15; letter-spacing: -0.5px; word-break: break-word; }
        .art-meta { display: flex; gap: 24px; align-items: center; flex-wrap: wrap; font-size: 13px; }
        .art-content { font-size: 17px; line-height: 1.9; color: #1a1a1a; }
        .art-content p { margin: 20px 0; word-break: break-word; overflow-wrap: break-word; }
        .art-content h2 { font-size: 28px; font-weight: 700; margin: 32px 0 16px; word-break: break-word; }
        .art-content h3 { font-size: 22px; font-weight: 700; margin: 24px 0 12px; word-break: break-word; }
        .art-content h1 { font-size: 32px; font-weight: 700; margin: 24px 0 12px; word-break: break-word; }
        .art-content ul, .art-content ol { margin: 16px 0; padding-left: 24px; }
        .art-content li { margin: 8px 0; word-break: break-word; }
        .art-content blockquote { border-left: 4px solid #C62828; padding-left: 20px; margin: 24px 0; font-style: italic; color: #666; word-break: break-word; }
        .art-content table { width: 100%; border-collapse: collapse; margin: 24px 0; }
        .art-content th, .art-content td { border: 1px solid #E5E5E5; padding: 12px; text-align: left; word-break: break-word; }
        .art-content th { background: #F8F8F8; font-weight: 600; }
        .art-content img { max-width: 100%; height: auto; display: block; margin: 20px 0; border-radius: 8px; }
        .art-content a { color: #1565C0; text-decoration: none; }
        .art-content a:hover { text-decoration: underline; }
        .art-content strong { font-weight: 700; }
        .art-content em { font-style: italic; }
        @media (max-width: 768px) {
          .art-grid { grid-template-columns: 1fr !important; gap: 24px; padding: 24px 16px !important; }
          .sidebar-col { display: none; }
          .rel-grid { grid-template-columns: 1fr 1fr !important; }
          .art-title { font-size: 28px !important; }
        }
        @media (max-width: 480px) {
          .rel-grid { grid-template-columns: 1fr !important; }
          .art-title { font-size: 24px !important; }
          .art-meta { gap: 12px; font-size: 12px; }
        }
      `}</style>

      {/* HEADER */}
      <header style={{ background:'white', borderBottom:'1px solid #E5E5E5', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px' }}>
          <Link href="/" style={{ fontFamily:'Playfair Display, serif', fontSize:28, fontWeight:900, color:'#0D1B2A', textDecoration:'none', letterSpacing: -1 }}>
            NEWS<span style={{ color:'#C62828' }}>FLASH</span>
          </Link>
          <nav style={{ display:'flex', gap:24, alignItems:'center' }}>
            {['India','World','Business','Technology','Sports'].map(c => (
              <Link key={c} href={`/?category=${c}`} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:0.5, textTransform:'uppercase', color:'#666', textDecoration:'none', transition: 'color 0.2s' }}>{c}</Link>
            ))}
          </nav>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div style={{ background:'#F8F8F8', borderBottom:'1px solid #E5E5E5', padding:'12px 20px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'#999' }}>
          <Link href="/" style={{ color:'#999', textDecoration:'none' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <Link href={`/?category=${a.category}`} style={{ color:'#999', textDecoration:'none' }}>{a.category}</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color:'#666' }}>{a.title.slice(0, 50)}{a.title.length > 50 ? '…' : ''}</span>
        </div>
      </div>

      <div className="art-grid">
        {/* ARTICLE */}
        <article>
          {/* CATEGORY BADGE */}
          <div style={{ marginBottom: 20 }}>
            <span style={{ display:'inline-block', background: a.category === 'Sports' ? '#1B5E20' : a.category === 'Technology' ? '#1565C0' : a.category === 'Business' ? '#E65100' : '#C62828', color:'white', fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing:1.5, textTransform:'uppercase', padding:'6px 12px', borderRadius: 4, fontWeight: 600 }}>{a.category}</span>
          </div>

          {/* TITLE */}
          <h1 className="art-title" style={{ fontFamily:'Playfair Display, serif', color:'#0D1B2A', marginBottom:20, marginTop: 0 }}>{a.title}</h1>

          {/* SUMMARY */}
          <p style={{ fontSize:18, color:'#444', lineHeight:1.7, marginBottom:24, fontWeight: 500 }}>{a.summary}</p>

          {/* META */}
          <div className="art-meta" style={{ paddingBottom:24, borderBottom:'1px solid #E5E5E5', marginBottom:32, color:'#666' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>✍️</span>
              <div>
                <div style={{ fontWeight: 600, color: '#0D1B2A' }}>{a.author || 'NewsFlash Editorial'}</div>
                <div style={{ fontSize: 12, color: '#999' }}>Author</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>📅</span>
              <div>
                <div style={{ fontWeight: 600, color: '#0D1B2A' }}>{fmt(a.createdAt)}</div>
                <div style={{ fontSize: 12, color: '#999' }}>Published</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>⏱</span>
              <div>
                <div style={{ fontWeight: 600, color: '#0D1B2A' }}>{a.readTime || 3} min</div>
                <div style={{ fontSize: 12, color: '#999' }}>Read time</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>👁</span>
              <div>
                <div style={{ fontWeight: 600, color: '#0D1B2A' }}>{(a.views || 0).toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 12, color: '#999' }}>Views</div>
              </div>
            </div>
          </div>

          {/* FEATURED IMAGE */}
          {a.featuredImage && (
            <figure style={{ margin:'0 0 32px', borderRadius: 8, overflow: 'hidden' }}>
              <img src={a.featuredImage} alt={a.title} style={{ width:'100%', height: 'auto', display: 'block', maxHeight: 500, objectFit: 'cover' }} />
            </figure>
          )}

          {/* VIDEO */}
          {embedUrl && (
            <div style={{ position:'relative', paddingBottom:'56.25%', height:0, marginBottom:32, borderRadius:8, overflow:'hidden', background: '#000' }}>
              <iframe src={embedUrl} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }} allowFullScreen title={a.title} />
            </div>
          )}

          {/* KEY HIGHLIGHTS */}
          {a.keyHighlights?.length > 0 && (
            <div style={{ background:'linear-gradient(135deg, #FFF5F5, #FFF0F0)', border:'1px solid #FFE0E0', borderRadius:8, padding:24, marginBottom:32 }}>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#C62828', marginBottom:16, fontWeight: 700 }}>⚡ Key Highlights</div>
              <ul style={{ paddingLeft:20, margin:0, listStyle: 'none' }}>
                {a.keyHighlights.map((h, i) => <li key={i} style={{ fontSize:15, lineHeight:1.8, color:'#333', marginBottom:8, paddingLeft: 20, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#C62828', fontWeight: 700 }}>•</span>
                  {h}
                </li>)}
              </ul>
            </div>
          )}

          {/* CONTENT */}
          <div className="art-content">
            <ArticleRenderer content={a.content} />
          </div>

          {/* Mid-Article Ad */}
          <div style={{ margin:'40px 0', padding:'24px 0', borderTop: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5' }}>
            <AdSlotServer slotId="banner-728x90" style={{ minHeight: 90, textAlign: 'center' }} />
          </div>

          {/* TAGS */}
          {a.tags?.length > 0 && (
            <div style={{ marginTop:32, paddingTop:24, borderTop:'1px solid #E5E5E5' }}>
              <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#999', marginRight:16, fontWeight: 600 }}>Tags:</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                {a.tags.map(t => (
                  <span key={t} style={{ display:'inline-block', background:'#F0F0F0', fontFamily:'JetBrains Mono, monospace', fontSize:12, padding:'6px 12px', borderRadius:4, color:'#666', fontWeight: 500 }}>#{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* SHARE */}
          <div style={{ marginTop:32, padding:24, background:'#F8F8F8', borderRadius:8 }}>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#666', marginBottom:16, fontWeight: 700 }}>📤 Share this article</div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {[
                { label:'Twitter', color:'#000', href:`https://twitter.com/intent/tweet?text=${encodeURIComponent(a.title)}&url=${encodeURIComponent(SITE_URL+'/article/'+a.slug)}` },
                { label:'WhatsApp', color:'#25D366', href:`https://wa.me/?text=${encodeURIComponent(a.title+' '+SITE_URL+'/article/'+a.slug)}` },
                { label:'Facebook', color:'#1877F2', href:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL+'/article/'+a.slug)}` },
                { label:'LinkedIn', color:'#0A66C2', href:`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL+'/article/'+a.slug)}` },
              ].map(s => (
                <div key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ background:s.color, color:'white', padding:'10px 16px', fontFamily:'JetBrains Mono, monospace', fontSize:12, letterSpacing:0.5, textDecoration:'none', borderRadius:4, textTransform:'uppercase', fontWeight: 600, transition: 'opacity 0.2s', cursor: 'pointer', display: 'inline-block' }}>
                    {s.label}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* REFERENCE LINKS */}
          {a.referenceLinks?.filter(r => r.url)?.length > 0 && (
            <div style={{ marginTop:32, padding:24, background:'#F0F8FF', border:'1px solid #D0E8FF', borderRadius:8 }}>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#1565C0', marginBottom:16, fontWeight: 700 }}>📚 Sources & References</div>
              {a.referenceLinks.filter(r => r.url).map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer nofollow"
                  style={{ display:'block', fontSize:14, color:'#1565C0', marginBottom:8, textDecoration:'none', fontFamily:'Inter, sans-serif', fontWeight: 500 }}>
                  ↗ {r.sourceName || r.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                </a>
              ))}
            </div>
          )}

          {/* RELATED */}
          {related.length > 0 && (
            <div style={{ marginTop:48 }}>
              <div style={{ fontFamily:'Playfair Display, serif', fontSize:24, fontWeight:700, color:'#0D1B2A', marginBottom:24, paddingBottom: 16, borderBottom: '2px solid #C62828' }}>Related Articles</div>
              <div className="rel-grid">
                {related.map(r => (
                  <Link key={String(r._id)} href={`/article/${r.slug}`} style={{ textDecoration:'none', color:'inherit' }}>
                    <div style={{ aspectRatio:'16/9', background:'linear-gradient(135deg,#E0E0E0,#D0D0D0)', borderRadius:8, marginBottom:12, overflow:'hidden', cursor: 'pointer', transition: 'transform 0.3s' }}>
                      {r.featuredImage && <img src={r.featuredImage} alt={r.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                    </div>
                    <h4 style={{ fontFamily:'Playfair Display, serif', fontSize:16, fontWeight:700, lineHeight:1.4, color:'#0D1B2A', marginBottom: 8 }}>{r.title}</h4>
                    <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, color:'#999', margin: 0 }}>{fmt(r.createdAt)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* SIDEBAR */}
        <aside className="sidebar-col">
          <div style={{ position:'sticky', top:80 }}>
            {/* Table of Contents */}
            <TableOfContents content={a.content} />

            {/* Ad Slot 1 */}
            <div style={{ marginBottom:32, borderRadius: 8, overflow: 'hidden', background: '#F8F8F8', padding: 12 }}>
              <AdSlotServer slotId="banner-300x250" style={{ minHeight: 250 }} />
            </div>

            {/* More from Category */}
            <div style={{ background: 'white', borderRadius: 8, padding: 24, border: '1px solid #E5E5E5' }}>
              <div style={{ fontFamily:'Playfair Display, serif', fontSize:16, fontWeight:700, color:'#0D1B2A', marginBottom:20 }}>More from {a.category}</div>
              {related.map((r, idx) => (
                <div key={String(r._id)}>
                  <Link href={`/article/${r.slug}`} style={{ display:'block', padding:`12px 0 ${idx < related.length - 1 ? '12px' : '0'}`, borderBottom: idx < related.length - 1 ? '1px solid #E5E5E5' : 'none', textDecoration:'none', transition: 'color 0.2s' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#0D1B2A', lineHeight:1.4 }}>{r.title}</div>
                    <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'#999', marginTop:6 }}>{fmt(r.createdAt)}</div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* FOOTER */}
      <footer style={{ background:'#0D1B2A', color:'#888', marginTop:64, borderTop: '1px solid #1A1A1A' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 32, marginBottom: 32 }}>
            <div>
              <Link href="/" style={{ fontFamily:'Playfair Display, serif', fontSize:20, fontWeight:900, color:'white', textDecoration:'none', display: 'block', marginBottom: 12 }}>NEWS<span style={{ color:'#C62828' }}>FLASH</span></Link>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: '#999', margin: 0 }}>India's trusted digital newsroom — breaking news, live scores, and updates 24/7.</p>
            </div>
            <div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#C62828', marginBottom: 12, fontWeight: 700 }}>Sections</div>
              {['India', 'World', 'Business', 'Technology'].map(c => (
                <Link key={c} href={`/?category=${c}`} style={{ display: 'block', fontSize: 13, color: '#888', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s', cursor: 'pointer' }}>{c}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#C62828', marginBottom: 12, fontWeight: 700 }}>Portals</div>
              {[['Cricket', '/cricket'], ['Sarkari', '/sarkari']].map(([l, h]) => (
                <Link key={l} href={h} style={{ display: 'block', fontSize: 13, color: '#888', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s', cursor: 'pointer' }}>{l}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#C62828', marginBottom: 12, fontWeight: 700 }}>Company</div>
              {[['About', '/about'], ['Contact', '/contact'], ['Privacy', '/privacy-policy']].map(([l, h]) => (
                <Link key={l} href={h} style={{ display: 'block', fontSize: 13, color: '#888', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s', cursor: 'pointer' }}>{l}</Link>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'#555' }}>© {new Date().getFullYear()} NewsFlash Media. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 16 }}>
              {[['Privacy', '/privacy-policy'], ['Terms', '/terms']].map(([l, h]) => (
                <Link key={l} href={h} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'#555', textDecoration:'none' }}>{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
