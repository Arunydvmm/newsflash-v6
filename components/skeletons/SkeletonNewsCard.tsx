import React from 'react'
import SkeletonBlock from './SkeletonBlock'
import styles from '@/styles/skeleton.module.css'

interface SkeletonNewsCardProps {
  count?: number
}

const SkeletonNewsCard: React.FC<SkeletonNewsCardProps> = ({ count = 1 }) => {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={styles.skeletonCard}
          style={{
            background: '#1a1a1a',
            padding: '16px',
            borderRadius: '8px'
          }}
        >
          {/* Image placeholder */}
          <SkeletonBlock
            width="100%"
            height={180}
            borderRadius="8px"
            style={{ marginBottom: '12px' }}
          />

          {/* Category badge */}
          <SkeletonBlock
            width={60}
            height={20}
            borderRadius="20px"
            style={{ marginBottom: '12px' }}
          />

          {/* Title - 2 lines */}
          <SkeletonBlock
            width="90%"
            height={16}
            borderRadius="4px"
            style={{ marginBottom: '8px' }}
          />
          <SkeletonBlock
            width="60%"
            height={16}
            borderRadius="4px"
            style={{ marginBottom: '12px' }}
          />

          {/* Author + date */}
          <SkeletonBlock
            width="40%"
            height={12}
            borderRadius="4px"
            style={{ marginBottom: '8px' }}
          />

          {/* Read time */}
          <SkeletonBlock
            width="30%"
            height={12}
            borderRadius="4px"
          />
        </div>
      ))}
    </div>
  )
}

export default SkeletonNewsCard
