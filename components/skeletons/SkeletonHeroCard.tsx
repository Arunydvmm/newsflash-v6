import React from 'react'
import SkeletonBlock from './SkeletonBlock'
import styles from '@/styles/skeleton.module.css'

const SkeletonHeroCard: React.FC = () => {
  return (
    <div
      className={styles.skeletonCard}
      style={{
        background: '#1a1a1a',
        padding: '24px',
        borderRadius: '8px'
      }}
    >
      {/* Large image placeholder */}
      <SkeletonBlock
        width="100%"
        height={300}
        borderRadius="8px"
        style={{ marginBottom: '20px' }}
      />

      {/* Large title - 3 lines */}
      <SkeletonBlock
        width="95%"
        height={24}
        borderRadius="4px"
        style={{ marginBottom: '12px' }}
      />
      <SkeletonBlock
        width="85%"
        height={24}
        borderRadius="4px"
        style={{ marginBottom: '12px' }}
      />
      <SkeletonBlock
        width="75%"
        height={24}
        borderRadius="4px"
        style={{ marginBottom: '20px' }}
      />

      {/* Description - 2 lines */}
      <SkeletonBlock
        width="90%"
        height={16}
        borderRadius="4px"
        style={{ marginBottom: '8px' }}
      />
      <SkeletonBlock
        width="70%"
        height={16}
        borderRadius="4px"
        style={{ marginBottom: '20px' }}
      />

      {/* Author row with circle avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <SkeletonBlock
          width={48}
          height={48}
          borderRadius="50%"
          className={styles.skeletonAvatar}
        />
        <div style={{ flex: 1 }}>
          <SkeletonBlock
            width="40%"
            height={14}
            borderRadius="4px"
            style={{ marginBottom: '8px' }}
          />
          <SkeletonBlock
            width="30%"
            height={12}
            borderRadius="4px"
          />
        </div>
      </div>
    </div>
  )
}

export default SkeletonHeroCard
