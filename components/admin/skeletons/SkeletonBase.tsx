// Base shimmer skeleton element
export function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[var(--cyber-card)] border border-[var(--cyber-border)] ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[#00d9ff0a] to-transparent" />
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}

export function SkeletonText({ className = '', width = 'w-full' }: { className?: string; width?: string }) {
  return <SkeletonBox className={`h-3 rounded-none ${width} ${className}`} />
}

export function SkeletonTitle({ className = '' }: { className?: string }) {
  return <SkeletonBox className={`h-5 w-48 rounded-none ${className}`} />
}