'use client'
// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { CATEGORIES } from '../lib/categories'

// Re-export for convenience
export { CATEGORIES } from '../lib/categories'

// ── Theme ────────────────────────────────────────────────────────
const T = {
  red:    '#C62828',
  navy:   '#0D1B2A',
  gold:   '#D4A017',
  dark:   '#1A1A1A',
  light:  '#F4F4F0',
  white:  '#FFFFFF',
  muted:  '#6B7280',
  border: '#E5E7EB',
}

// ── Loading Bar ──────────────────────────────────────────────────
export function LoadingBar() {
  const [w, setW]   = useState(0)
  const [vis, setVis] = useState(true)
  useEffect(() => {
    setW(20)
    const t1 = setTimeout(() => setW(60),  300)
    const t2 = setTimeout(() => setW(90),  800)
    const t3 = setTimeout(() => { setW(100); setTimeout(() => setVis(false), 400) }, 1400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])
  if (!vis) return null
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, height: 3, background: 'rgba(0,0,0,0.1)' }}>
      <div style={{ height: '100%', background: `linear-gradient(90deg,${T.red},${T.gold},${T.red})`, backgroundSize: '200% 100%', width: `${w}%`, transition: 'width 0.5s ease', boxShadow: `0 0 10px ${T.red}80`, animation: 'shimmerBar 1.5s infinite' }} />
    </div>
  )
}

// ── Welcome Popup ────────────────────────────────────────────────
export function WelcomePopup() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!sessionStorage.getItem('nf_popup')) setTimeout(() => setShow(true), 2000)
  }, [])
  function close() { setShow(false); sessionStorage.setItem('nf_popup', '1') }
  if (!show) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={close}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease' }} />
      <div onClick={e => e.stopPropagation()}
        style={{ position: 'relative', background: 'white', borderRadius: 20, padding: '44px 40px', maxWidth: 480, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.35)', animation: 'slideUp 0.4s ease', textAlign: 'center', overflow: 'hidden' }}>
        {/* Gold top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${T.red},${T.gold},${T.navy})` }} />
        <button onClick={close} style={{ position: 'absolute', top: 14, right: 18, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#ccc' }}>×</button>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 34, fontWeight: 900, color: T.dark, marginBottom: 4 }}>
          NEWS<span style={{ color: T.red }}>FLASH</span>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 3, color: '#aaa', textTransform: 'uppercase', marginBottom: 20 }}>India's Fastest News Platform</div>
        <div style={{ width: 60, height: 3, background: `linear-gradient(90deg,${T.red},${T.gold})`, borderRadius: 2, margin: '0 auto 20px' }} />
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.9, marginBottom: 28 }}>
          Breaking news · IPL live scores · Sarkari Naukri · Cricket analytics · Education updates — all in one place, updated 24/7.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={close} style={{ background: `linear-gradient(135deg,${T.red},#B71C1C)`, color: 'white', border: 'none', padding: '12px 28px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: `0 4px 16px ${T.red}50` }}>
            Start Reading →
          </button>
          <Link href="/cricket" onClick={close} style={{ background: '#E8F5E9', color: '#1B5E20', padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
            🏏 Live Scores
          </Link>
          <Link href="/sarkari" onClick={close} style={{ background: '#FFF3E0', color: '#E65100', padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
            🏛 Sarkari Jobs
          </Link>
        </div>
        <div style={{ marginTop: 18, fontSize: 11, color: '#ddd', fontFamily: 'JetBrains Mono, monospace' }}>Click outside to close</div>
      </div>
    </div>
  )
}

// ── Hero Slider ──────────────────────────────────────────────────
export function HeroSlider({ articles }: { articles: any[] }) {
  const [cur, setCur]   = useState(0)
  const [fade, setFade] = useState(true)
  const timer = useRef<any>(null)

  const go = useCallback((idx: number) => {
    setFade(false)
    setTimeout(() => { setCur(idx); setFade(true) }, 300)
    clearInterval(timer.current)
    timer.current = setInterval(() => setCur(p => (p + 1) % articles.length), 5500)
  }, [articles.length])

  useEffect(() => {
    timer.current = setInterval(() => setCur(p => (p + 1) % articles.length), 5500)
    return () => clearInterval(timer.current)
  }, [articles.length])

  if (!articles.length) return null
  const a = articles[cur]

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.2)', marginBottom: 32 }}>
      <div style={{ position: 'relative', aspectRatio: '16/7', background: T.dark, overflow: 'hidden' }}>
        {a.featuredImage
          ? <img src={a.featuredImage} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: fade ? 1 : 0, transform: fade ? 'scale(1)' : 'scale(1.03)', transition: 'all 0.5s ease', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg,${T.navy},${T.red})` }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.25) 55%,transparent 100%)' }} />
        {/* Breaking badge */}
        {a.isBreaking && (
          <div style={{ position: 'absolute', top: 16, left: 16, background: T.red, color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, padding: '4px 12px', borderRadius: 4, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, background: 'white', borderRadius: '50%', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
            Breaking
          </div>
        )}
        {/* Content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 32px', opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.4s ease' }}>
          {(() => { const cat = CATEGORIES.find(c => c.label === a.category); return cat ? (
            <span style={{ background: cat.color, color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 4, marginBottom: 10, display: 'inline-block' }}>{cat.icon} {cat.label}</span>
          ) : null })()}
          <Link href={`/article/${a.slug}`} style={{ textDecoration: 'none' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(18px,2.8vw,30px)', fontWeight: 900, color: 'white', lineHeight: 1.25, marginBottom: 10, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>{a.title}</h2>
          </Link>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.summary}</p>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'flex', gap: 12 }}>
            <span>{a.author || 'NewsFlash'}</span><span>·</span><span>{a.readTime || 1} min read</span>
          </div>
        </div>
      </div>
      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 18, right: 20, display: 'flex', gap: 4 }}>
        {articles.map((_, i) => (
          <button key={i} onClick={() => go(i)} style={{ width: i === cur ? 12 : 4, height: 4, borderRadius: 2, background: i === cur ? T.gold : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
        ))}
      </div>
      {/* Arrows */}
      {[{ dir: '‹', pos: 'left' }, { dir: '›', pos: 'right' }].map(({ dir, pos }) => (
        <button key={pos} onClick={() => go(pos === 'left' ? (cur - 1 + articles.length) % articles.length : (cur + 1) % articles.length)}
          style={{ position: 'absolute', [pos]: 14, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', transition: 'all 0.2s' }}>
          {dir}
        </button>
      ))}
    </div>
  )
}

// ── Category Button ──────────────────────────────────────────────
export function CategoryButton({ cat, active }: { cat: any; active: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)} 
      onMouseLeave={() => setHov(false)}
      style={{ flexShrink: 0 }}>
      <Link href={cat.href || `/?category=${cat.label}`} style={{ textDecoration: 'none' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
          borderRadius: 24, border: `1.5px solid ${active ? cat.color : hov ? cat.color : T.border}`,
          background: active ? cat.color : hov ? cat.bg : 'white',
          color: active ? 'white' : hov ? cat.color : '#555',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: active ? 700 : 500,
          letterSpacing: 0.5, transition: 'all 0.2s ease', cursor: 'pointer',
          boxShadow: active ? `0 4px 14px ${cat.color}40` : hov ? `0 2px 8px ${cat.color}25` : 'none',
          transform: hov && !active ? 'translateY(-1px)' : 'translateY(0)',
        }}>
          <span style={{ fontSize: 14 }}>{cat.icon}</span>
          {cat.label}
        </div>
      </Link>
    </div>
  )
}

// ── Article Card ─────────────────────────────────────────────────
export function ArticleCard({ a, size = 'md', horizontal = false }: { a: any; size?: 'sm'|'md'|'lg'; horizontal?: boolean }) {
  const [hov, setHov] = useState(false)
  const cat = CATEGORIES.find(c => c.label === a.category)
  const fmt = (d: any) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  if (horizontal) return (
    <div
      onMouseEnter={() => setHov(true)} 
      onMouseLeave={() => setHov(false)}>
      <Link href={`/article/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #F0F0EC' }}>
        <div style={{ width: 80, height: 60, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#E8E8E4' }}>
          {a.featuredImage && <img src={a.featuredImage} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.3s' }} loading="lazy" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: hov ? T.red : T.dark, lineHeight: 1.4, marginBottom: 4, transition: 'color 0.2s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#666' }}>{fmt(a.createdAt)} · {a.readTime || 1} min</div>
        </div>
      </Link>
    </div>
  )

  return (
    <div
      onMouseEnter={() => setHov(true)} 
      onMouseLeave={() => setHov(false)}
      style={{ height: '100%' }}>
      <Link href={`/article/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', height: '100%', boxShadow: hov ? '0 10px 36px rgba(0,0,0,0.13)' : '0 2px 12px rgba(0,0,0,0.06)', transform: hov ? 'translateY(-4px)' : 'translateY(0)', transition: 'all 0.25s ease', border: `1px solid ${T.border}` }}>
          <div style={{ aspectRatio: size === 'sm' ? '16/9' : '16/10', overflow: 'hidden', background: '#E8E8E4', position: 'relative' }}>
            {a.featuredImage
              ? <img src={a.featuredImage} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.4s ease' }} loading="lazy" />
              : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg,${cat?.color || T.red}22,${T.navy}22)` }} />
            }
            {a.isBreaking && <div style={{ position: 'absolute', top: 8, left: 8, background: T.red, color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 1.5, padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>⚡ Breaking</div>}
          </div>
          <div style={{ padding: size === 'sm' ? '10px 12px' : '14px 16px' }}>
            {cat && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: cat.bg, color: cat.color, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, marginBottom: 8, fontWeight: 600 }}>{cat.icon} {cat.label}</span>}
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: size === 'sm' ? 14 : 16, fontWeight: 700, lineHeight: 1.35, color: hov ? T.red : T.dark, marginBottom: 8, transition: 'color 0.2s', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</h3>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#666', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span>{fmt(a.createdAt)}</span><span>·</span><span>{a.readTime || 1} min</span>
              {a.views > 0 && <><span>·</span><span>{a.views.toLocaleString('en-IN')} views</span></>}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────
export function Skeleton({ h = 200 }: { h?: number }) {
  const s = { backgroundImage: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div style={{ height: h, ...s }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ height: 10, width: '35%', borderRadius: 4, marginBottom: 10, ...s }} />
        <div style={{ height: 14, width: '92%', borderRadius: 4, marginBottom: 8, ...s }} />
        <div style={{ height: 14, width: '68%', borderRadius: 4, ...s }} />
      </div>
    </div>
  )
}
