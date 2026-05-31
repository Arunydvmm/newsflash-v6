import React from 'react'
import SkeletonBlock from './SkeletonBlock'
import styles from '@/styles/skeleton.module.css'

const SkeletonTrendingList: React.FC = () => {
  return (
    <div
      className={styles.skeletonCard}
      style={{
        background: '#1a1a1a',
        padding: '16px',
        borderRadius: '8px'
      }}
    >
      {/* 6 rows, each with number + text line */}
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: index < 5 ? '12px' : '0'
          }}
        >
          {/* Number placeholder */}
          <SkeletonBlock
            width={24}
            height={24}
            borderRadius="4px"
          />

          {/* Text line */}
          <SkeletonBlock
            width="80%"
            height={14}
            borderRadius="4px"
          />
        </div>
      ))}
    </div>
  )
}

export default SkeletonTrendingList
