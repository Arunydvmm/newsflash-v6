import React from 'react'
import SkeletonBlock from './SkeletonBlock'
import styles from '@/styles/skeleton.module.css'

const SkeletonNavbar: React.FC = () => {
  return (
    <div
      className={styles.skeletonCard}
      style={{
        background: '#1a1a1a',
        padding: '16px 24px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {/* Logo placeholder */}
      <SkeletonBlock
        width={120}
        height={32}
        borderRadius="4px"
      />

      {/* 4 nav link placeholders */}
      <div style={{ display: 'flex', gap: '24px' }}>
        <SkeletonBlock
          width={60}
          height={16}
          borderRadius="4px"
        />
        <SkeletonBlock
          width={60}
          height={16}
          borderRadius="4px"
        />
        <SkeletonBlock
          width={60}
          height={16}
          borderRadius="4px"
        />
        <SkeletonBlock
          width={60}
          height={16}
          borderRadius="4px"
        />
      </div>

      {/* Search icon placeholder */}
      <SkeletonBlock
        width={32}
        height={32}
        borderRadius="4px"
      />
    </div>
  )
}

export default SkeletonNavbar
