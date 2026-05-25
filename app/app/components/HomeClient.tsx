'use client'
// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// ── Skeleton loader ──────────────────────────────────────────────
export function SkeletonCard({ h = 200 }: { h?: number }) {
  return (
    <div style={{
      borderRadius: 10, overflow: 'hidden', background: 'white',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        height: h, background: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
      }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ height: 10, width: '40%', background: '#f0f0ec', borderRadius: 4, marginBottom: 10, animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)' }} />
        <div style={{ height: 14, width: '90%', background: '#f0f0ec', borderRadius: 4, marginBottom: 8, animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)' }} />
        <div style={{ height: 14, width: '70%', background: '#f0f0ec', borderRadius: 4, animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg,#f0f0ec 25%,#e4e4e0 50%,#f0f0ec 75%)' }} />
      </div>
    </div>
  )
}

// ── Hero Slider ──────────────────────────────────────────────────
export function HeroSlider({ articles }: { articles: any[] }) {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef<any>(null)

  const go = useCallback((idx: number) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => { setCurrent(idx); setAnimating(false) }, 350)
  }, [animating])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent(p => (p + 1) % articles.length)
    }, 5000)
    return () => clearInterval(timerRef.current)
  }, [articles.length])

  if (!articles.length) return null
  const a = articles[current]

  return (
    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', marginBottom: 28 }}>
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '16/7', background: '#1A1A1A', overflow: 'hidden' }}>
        {a.featuredImage
          ? <img src={a.featuredImage} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: animating ? 0 : 1, transition: 'opacity 0.35s ease', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1A1A1A,#C62828)' }} />
        }
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />
        {/* Content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 32px', opacity: animating ? 0 : 1, transform: animating ? 'translateY(10px)' : 'translateY(0)', transition: 'all 0.35s ease' }}>
          <span style={{ background: '#C62828', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 2, marginBottom: 10, display: 'inline-block' }}>{a.category}</span>
          <Link href={`/article/${a.slug}`} style={{ textDecoration: 'none' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(18px,3vw,30px)', fontWeight: 900, color: 'white', lineHeight: 1.25, marginBottom: 10, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{a.title}</h2>
          </Link>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.summary}</p>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>
            {a.author || 'NewsFlash'} · {a.readTime || 1} min read
          </div>
        </div>
      </div>
      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 16, right: 20, display: 'flex', gap: 6 }}>
        {articles.map((_, i) => (
          <button key={i} onClick={() => go(i)} style={{ width: i === current ? 20 : 7, height: 7, borderRadius: 4, background: i === current ? '#C62828' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
        ))}
      </div>
      {/* Arrows */}
      <button onClick={() => go((current - 1 + articles.length) % articles.length)}
        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', color: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>‹</button>
      <button onClick={() => go((current + 1) % articles.length)}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', color: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>›</button>
    </div>
  )
}

// ── Welcome Popup ────────────────────────────────────────────────
export function WelcomePopup() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('nf_popup_seen')
    if (!seen) {
      const t = setTimeout(() => setShow(true), 1800)
      return () => clearTimeout(t)
    }
  }, [])

  function close() {
    setShow(false)
    sessionStorage.setItem('nf_popup_seen', '1')
  }

  if (!show) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={close}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', animation: 'fadeIn 0.3s ease' }} />
      {/* Card */}
      <div onClick={e => e.stopPropagation()}
        style={{ position: 'relative', background: 'white', borderRadius: 16, padding: '40px 36px', maxWidth: 460, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.3)', animation: 'slideUp 0.4s ease', textAlign: 'center' }}>
        {/* Close */}
        <button onClick={close} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>×</button>
        {/* Logo */}
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 900, color: '#1A1A1A', marginBottom: 6 }}>
          NEWS<span style={{ color: '#C62828' }}>FLASH</span>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', marginBottom: 20 }}>
          India's Fastest News Platform
        </div>
        <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg,#C62828,#D4A017)', borderRadius: 2, margin: '0 auto 20px' }} />
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, marginBottom: 24 }}>
          Get breaking news, IPL live scores, Sarkari Naukri updates and cricket analytics — all in one place.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={close}
            style={{ background: 'linear-gradient(135deg,#C62828,#B71C1C)', color: 'white', border: 'none', padding: '11px 28px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 14px rgba(198,40,40,0.4)' }}>
            Start Reading →
          </button>
          <Link href="/cricket" onClick={close}
            style={{ background: '#E8F5E9', color: '#1B5E20', border: 'none', padding: '11px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
            🏏 Live Scores
          </Link>
        </div>
        <div style={{ marginTop: 16, fontSize: 11, color: '#ccc', fontFamily: 'JetBrains Mono, monospace' }}>
          Click anywhere outside to close
        </div>
      </div>
    </div>
  )
}

// ── Article Card ─────────────────────────────────────────────────
export function ArticleCard({ a, size = 'md' }: { a: any; size?: 'sm' | 'md' | 'lg' }) {
  const [hovered, setHovered] = useState(false)
  const fmt = (d: any) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <Link href={`/article/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{
        background: 'white', borderRadius: 10, overflow: 'hidden',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.25s ease', height: '100%',
      }}>
        <div style={{ aspectRatio: size === 'sm' ? '16/9' : '16/10', overflow: 'hidden', background: 'linear-gradient(135deg,#e8e4dc,#d4cfc6)', position: 'relative' }}>
          {a.featuredImage
            ? <img src={a.featuredImage} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s ease' }} loading="lazy" />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#C62828,#1A1A1A)', opacity: 0.15 }} />
          }
          {a.isBreaking && (
            <div style={{ position: 'absolute', top: 10, left: 10, background: '#C62828', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 2, padding: '3px 8px', borderRadius: 2, textTransform: 'uppercase' }}>⚡ Breaking</div>
          )}
        </div>
        <div style={{ padding: size === 'sm' ? '10px 12px' : '14px 16px' }}>
          <span style={{ display: 'inline-block', background: '#FFF0F0', color: '#C62828', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 2, marginBottom: 8 }}>{a.category}</span>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: size === 'sm' ? 14 : 16, fontWeight: 700, lineHeight: 1.35, color: hovered ? '#C62828' : '#1A1A1A', marginBottom: 8, transition: 'color 0.2s', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</h3>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#aaa', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span>{fmt(a.createdAt)}</span>
            <span>·</span>
            <span>{a.readTime || 1} min</span>
            {a.views > 0 && <><span>·</span><span>{a.views.toLocaleString('en-IN')} views</span></>}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Portal Cards ─────────────────────────────────────────────────
export function PortalCards() {
  const portals = [
    { label: 'Cricket Live', icon: '🏏', desc: 'IPL scores & match updates', href: '/cricket', color: '#1B5E20', bg: '#E8F5E9' },
    { label: 'Sarkari Naukri', icon: '🏛', desc: 'Latest government jobs', href: '/sarkari', color: '#E65100', bg: '#FFF3E0' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
      {portals.map(p => (
        <Link key={p.href} href={p.href} style={{ textDecoration: 'none' }}>
          <div style={{ background: p.bg, borderRadius: 10, padding: '18px 20px', border: `1.5px solid ${p.color}20`, display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${p.color}25` }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
            <span style={{ fontSize: 32 }}>{p.icon}</span>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: p.color }}>{p.label}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{p.desc}</div>
            </div>
            <span style={{ marginLeft: 'auto', color: p.color, fontSize: 18 }}>→</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ── Page Loading Bar ─────────────────────────────────────────────
export function LoadingBar() {
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setWidth(30)
    const t1 = setTimeout(() => setWidth(70), 200)
    const t2 = setTimeout(() => setWidth(95), 600)
    const t3 = setTimeout(() => { setWidth(100); setTimeout(() => setVisible(false), 300) }, 1000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  if (!visible) return null
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, height: 3 }}>
      <div style={{ height: '100%', background: 'linear-gradient(90deg,#C62828,#D4A017)', width: `${width}%`, transition: 'width 0.4s ease', borderRadius: '0 2px 2px 0', boxShadow: '0 0 8px rgba(198,40,40,0.6)' }} />
    </div>
  )
}
