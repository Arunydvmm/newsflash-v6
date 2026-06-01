interface Props {
  children: React.ReactNode
  className?: string
  glow?: boolean
  title?: string
  tag?: string
}

export default function CyberCard({ children, className = '', glow, title, tag }: Props) {
  return (
    <div className={`
      bg-[var(--cyber-card)] border border-[var(--cyber-border)]
      rounded-sm relative overflow-hidden
      ${glow ? 'shadow-[var(--cyber-glow)] border-[var(--cyber-primary)]' : ''}
      ${className}
    `}>
      {/* Top scan line accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--cyber-primary)] to-transparent opacity-60" />
      {(title || tag) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--cyber-border)]">
          {title && <span className="font-mono text-xs font-semibold text-[var(--cyber-primary)] uppercase tracking-widest">{title}</span>}
          {tag  && <span className="font-mono text-xs text-[var(--cyber-text-dim)] border border-[var(--cyber-border)] px-2 py-0.5">{tag}</span>}
        </div>
      )}
      {children}
    </div>
  )
}