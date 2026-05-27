'use client'
// @ts-nocheck
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function HomeButton() {
  const path = usePathname()
  // Only show on non-home pages, hide on admin/staff pages
  if (path === '/' || path.startsWith('/admin') || path.startsWith('/nf-') || path.startsWith('/staff')) return null

  return (
    <>
      <Link href="/" style={{
        position: 'fixed', bottom: 80, right: 16, zIndex: 999,
        background: '#C62828', color: 'white',
        width: 48, height: 48, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(198,40,40,0.45)',
        textDecoration: 'none', fontSize: 20,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(198,40,40,0.55)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(198,40,40,0.45)' }}
        title="Go to Home"
        aria-label="Go to Home"
      >
        🏠
      </Link>
      <style>{`
        @media (max-width: 768px) {
          /* On mobile, position above the bottom nav */
          a[title="Go to Home"] { bottom: 72px !important; }
        }
      `}</style>
    </>
  )
}
