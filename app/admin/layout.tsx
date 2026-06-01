'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import GlitchText from '@/components/cyber/GlitchText'

const NAV_ITEMS = [
  { label: 'DASHBOARD',    href: '/admin/dashboard',       icon: '⬡', tag: 'SYS' },
  { label: 'ALL ARTICLES', href: '/admin/articles',        icon: '◈', tag: 'DB'  },
  { label: 'NEW ARTICLE',  href: '/admin/articles/new',    icon: '+',  tag: 'CMD' },
  { label: 'PENDING',      href: '/admin/articles/pending', icon: '◉', tag: 'QUE' },
  { label: 'AI NEWSROOM',  href: '/admin/newsroom',        icon: '⚡', tag: 'AI'  },
  { label: 'EXAM PORTAL',  href: '/admin/exam-portal',     icon: '◆', tag: 'MOD' },
  { label: 'CRICKET',      href: '/admin/cricket',         icon: '◇', tag: 'MOD' },
  { label: 'EMPLOYEES',    href: '/admin/employees',       icon: '◎', tag: 'USR' },
  { label: 'INBOX',        href: '/admin/contacts',        icon: '▽', tag: 'MSG' },
  { label: 'ADS',          href: '/admin/ads',             icon: '▣', tag: 'SYS' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-[var(--cyber-bg)] flex" style={{ fontFamily: 'var(--cyber-sans)' }}>
      {/* Sidebar */}
      <aside className={`
        flex-shrink-0 bg-[var(--cyber-surface)] border-r border-[var(--cyber-border)]
        flex flex-col transition-all duration-300 relative
        ${collapsed ? 'w-14' : 'w-56'}
      `}>
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[var(--cyber-primary)] to-transparent" />

        {/* Logo */}
        <div className={`p-4 border-b border-[var(--cyber-border)] flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && <GlitchText text="NF_ADMIN" className="text-sm tracking-widest" />}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-[var(--cyber-text-dim)] hover:text-[var(--cyber-primary)] font-mono text-xs transition-colors"
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 transition-all duration-150
                  font-mono text-xs relative group
                  ${active
                    ? 'text-[var(--cyber-primary)] bg-[#00d9ff0d] border-r-2 border-[var(--cyber-primary)]'
                    : 'text-[var(--cyber-text-dim)] hover:text-[var(--cyber-primary)] hover:bg-[#00d9ff08]'
                  }
                `}
              >
                <span className="text-base leading-none flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 tracking-wider">{item.label}</span>
                    <span className="text-[10px] text-[var(--cyber-text-dim)] border border-[var(--cyber-border)] px-1 opacity-60">
                      {item.tag}
                    </span>
                  </>
                )}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[var(--cyber-primary)] shadow-[var(--cyber-glow-sm)]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom status */}
        {!collapsed && (
          <div className="p-4 border-t border-[var(--cyber-border)] space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyber-success)] animate-pulse" />
              <span className="font-mono text-xs text-[var(--cyber-text-dim)]">SYSTEM ONLINE</span>
            </div>
            <p className="font-mono text-xs text-[var(--cyber-text-dim)] opacity-50">
              {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[var(--cyber-surface)] border-b border-[var(--cyber-border)] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--cyber-text-dim)]">
            <span className="text-[var(--cyber-primary)]">~/admin</span>
            <span>/</span>
            <span>{NAV_ITEMS.find(n => pathname.startsWith(n.href))?.label ?? 'dashboard'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-[var(--cyber-text-dim)] hidden md:block">
              {new Date().toISOString().slice(0, 19)}Z
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyber-success)] animate-pulse" />
              <span className="font-mono text-xs text-[var(--cyber-text-dim)]">SUPER_ADMIN</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}