type Status = 'success' | 'warning' | 'danger' | 'info' | 'dim'

const colors: Record<Status, string> = {
  success: 'text-[var(--cyber-success)] border-[var(--cyber-success)] bg-[#00ff8811]',
  warning: 'text-[var(--cyber-warning)] border-[var(--cyber-warning)] bg-[#ffcc0011]',
  danger:  'text-[var(--cyber-danger)]  border-[var(--cyber-danger)]  bg-[#ff386011]',
  info:    'text-[var(--cyber-primary)] border-[var(--cyber-primary)] bg-[#00d9ff11]',
  dim:     'text-[var(--cyber-text-dim)] border-[var(--cyber-border)]'
}

export default function CyberBadge({ label, status = 'info', pulse }: { label: string; status?: Status; pulse?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs border px-2 py-0.5 ${colors[status]}`}>
      {pulse && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
        status === 'success' ? 'bg-[var(--cyber-success)]' :
        status === 'danger'  ? 'bg-[var(--cyber-danger)]'  :
        status === 'warning' ? 'bg-[var(--cyber-warning)]' : 'bg-[var(--cyber-primary)]'
      }`} />}
      {label}
    </span>
  )
}