'use client'
interface Props {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  prefix?: string
  error?: string
}

export default function CyberInput({ label, type = 'text', value, onChange, placeholder, prefix = '>', error }: Props) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-xs text-[var(--cyber-primary)] uppercase tracking-widest">
        {label}
      </label>
      <div className={`
        flex items-center gap-2 border bg-[var(--cyber-bg)] px-3 py-2.5
        transition-all duration-200
        ${error
          ? 'border-[var(--cyber-danger)]'
          : 'border-[var(--cyber-border)] focus-within:border-[var(--cyber-primary)] focus-within:shadow-[var(--cyber-glow-sm)]'
        }
      `}>
        <span className="font-mono text-xs text-[var(--cyber-primary)] select-none">{prefix}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent font-mono text-sm text-[var(--cyber-text)] placeholder-[var(--cyber-text-dim)] outline-none"
        />
      </div>
      {error && <p className="font-mono text-xs text-[var(--cyber-danger)]">{'>'}_  {error}</p>}
    </div>
  )
}