import { SkeletonBox, SkeletonText, SkeletonTitle } from './SkeletonBase'

export default function NewsroomSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <SkeletonBox className="h-7 w-56" />
        <SkeletonText width="w-80" />
      </div>
      {/* Engine control bar */}
      <div className="border border-[var(--cyber-border)] bg-[var(--cyber-card)] p-4 flex items-center gap-4">
        <SkeletonBox className="h-8 w-32" />
        <SkeletonBox className="h-8 w-28" />
        <SkeletonBox className="h-8 w-28" />
        <SkeletonBox className="h-4 w-48 ml-auto" />
      </div>
      {/* Pipeline slot */}
      <div className="border border-[var(--cyber-border)] bg-[var(--cyber-card)] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonTitle />
          <SkeletonBox className="h-5 w-16" />
        </div>
        <SkeletonText width="w-full" />
        <SkeletonBox className="h-2 w-full" />
        <SkeletonText width="w-40" />
      </div>
      {/* Agent tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="border border-[var(--cyber-border)] bg-[var(--cyber-card)] p-3 space-y-2">
            <SkeletonText width="w-20" />
            <SkeletonText width="w-full" />
            <SkeletonText width="w-16" />
            <SkeletonBox className="h-5 w-12" />
          </div>
        ))}
      </div>
      {/* Queue table */}
      <div className="border border-[var(--cyber-border)] bg-[var(--cyber-card)]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-[var(--cyber-border)]">
            <SkeletonText width="w-48" />
            <SkeletonText width="w-24" />
            <SkeletonBox className="h-5 w-16 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}