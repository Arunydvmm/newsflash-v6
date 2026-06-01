'use client'
interface Props {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'danger' | 'ghost'
  loading?: boolean
  disabled?: boolean
  className?: string
}

export default function CyberButton({ children, onClick, type = 'button', variant = 'primary', loading, disabled, className = '' }: Props) {
  const base = 'relative inline-flex items-center gap-2 px-4 py-2 font-mono text-sm font-medium transition-all duration-200 border outline-none cursor-pointer select-none'

  const variants = {
    primary: 'bg-transparent border-[var(--cyber-primary)] text-[var(--cyber-primary)] hover:bg-[var(--cyber-primary)] hover:text-black hover:shadow-[var(--cyber-glow)]',
    danger:  'bg-transparent border-[var(--cyber-danger)]  text-[var(--cyber-danger)]  hover:bg-[var(--cyber-danger)]  hover:text-white',
    ghost:   'bg-transparent border-[var(--cyber-border)]  text-[var(--cyber-text-dim)] hover:border-[var(--cyber-primary)] hover:text-[var(--cyber-primary)]'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading && (
        <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}