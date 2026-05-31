import React from 'react'
import SkeletonBlock from './SkeletonBlock'
import styles from '@/styles/skeleton.module.css'

const SkeletonBreakingTicker: React.FC = () => {
  return (
    <div
      className={styles.skeletonCard}
      style={{
        background: '#1a1a1a',
        padding: '12px 16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        height: '40px'
      }}
    >
      {/* BREAKING label box */}
      <SkeletonBlock
        width={80}
        height={24}
        borderRadius="4px"
        className={styles.skeletonPill}
      />

      {/* 3 text pill placeholders */}
      <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
        <SkeletonBlock
          width="25%"
          height={16}
          borderRadius="4px"
        />
        <SkeletonBlock
          width="25%"
          height={16}
          borderRadius="4px"
        />
        <SkeletonBlock
          width="25%"
          height={16}
          borderRadius="4px"
        />
      </div>
    </div>
  )
}

export default SkeletonBreakingTicker
