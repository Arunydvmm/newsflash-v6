import React from 'react'
import SkeletonBlock from './SkeletonBlock'
import styles from '@/styles/skeleton.module.css'

const SkeletonSarkariCard: React.FC = () => {
  return (
    <div
      className={styles.skeletonCard}
      style={{
        background: '#1a1a1a',
        padding: '16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px'
      }}
    >
      {/* Icon circle placeholder */}
      <SkeletonBlock
        width={48}
        height={48}
        borderRadius="50%"
        className={styles.skeletonAvatar}
      />

      {/* Content on right */}
      <div style={{ flex: 1 }}>
        {/* Job title */}
        <SkeletonBlock
          width="70%"
          height={18}
          borderRadius="4px"
          style={{ marginBottom: '12px' }}
        />

        {/* Department */}
        <SkeletonBlock
          width="50%"
          height={14}
          borderRadius="4px"
          style={{ marginBottom: '12px' }}
        />

        {/* Deadline */}
        <SkeletonBlock
          width="40%"
          height={12}
          borderRadius="4px"
          style={{ marginBottom: '16px' }}
        />

        {/* Apply button placeholder */}
        <SkeletonBlock
          width={100}
          height={32}
          borderRadius="4px"
        />
      </div>
    </div>
  )
}

export default SkeletonSarkariCard
