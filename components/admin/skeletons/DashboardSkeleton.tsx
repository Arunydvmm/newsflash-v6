import { SkeletonBox, SkeletonText, SkeletonTitle } from './SkeletonBase'

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page title */}
      <div className="space-y-2">
        <SkeletonBox className="h-7 w-48" />
        <SkeletonText width="w-72" />
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-[var(--cyber-border)] bg-[var(--cyber-card)] p-4 space-y-3">
            <SkeletonText width="w-16" />
            <SkeletonBox className="h-8 w-20" />
            <SkeletonText width="w-24" />
          </div>
        ))}
      </div>
      {/* Chart area */}
      <div className="border border-[var(--cyber-border)] bg-[var(--cyber-card)] p-4 space-y-3">
        <SkeletonTitle />
        <SkeletonBox className="h-48 w-full" />
      </div>
      {/* Table */}
      <div className="border border-[var(--cyber-border)] bg-[var(--cyber-card)]">
        <div className="p-4 border-b border-[var(--cyber-border)]">
          <SkeletonTitle />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-[var(--cyber-border)]">
            <SkeletonBox className="w-4 h-4 flex-shrink-0" />
            <SkeletonText width="w-64" />
            <SkeletonText width="w-20" />
            <SkeletonText width="w-16" />
            <SkeletonBox className="w-16 h-5 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}