import { SkeletonBox, SkeletonText, SkeletonTitle } from './SkeletonBase'

export default function ArticleTableSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-7 w-40" />
        <SkeletonBox className="h-8 w-32" />
      </div>
      {/* Filters */}
      <div className="flex gap-3">
        {[...Array(4)].map((_, i) => (
          <SkeletonBox key={i} className="h-8 w-24" />
        ))}
      </div>
      {/* Table */}
      <div className="border border-[var(--cyber-border)] bg-[var(--cyber-card)]">
        <div className="flex gap-4 p-3 border-b border-[var(--cyber-border)]">
          {['w-8', 'w-64', 'w-20', 'w-20', 'w-16', 'w-20'].map((w, i) => (
            <SkeletonText key={i} width={w} />
          ))}
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-[var(--cyber-border)]">
            <SkeletonBox className="w-4 h-4" />
            <div className="flex-1 space-y-1.5">
              <SkeletonText width="w-3/4" />
              <SkeletonText width="w-1/2" />
            </div>
            <SkeletonBox className="h-5 w-20" />
            <SkeletonText width="w-20" />
            <SkeletonBox className="h-7 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}