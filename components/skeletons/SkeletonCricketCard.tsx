import React from 'react'
import SkeletonBlock from './SkeletonBlock'
import styles from '@/styles/skeleton.module.css'

const SkeletonCricketCard: React.FC = () => {
  return (
    <div
      className={styles.skeletonCard}
      style={{
        background: '#1a1a1a',
        padding: '20px',
        borderRadius: '8px'
      }}
    >
      {/* Two team names side by side */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>
          <SkeletonBlock
            width="70%"
            height={20}
            borderRadius="4px"
            style={{ marginBottom: '8px' }}
          />
          <SkeletonBlock
            width="40%"
            height={14}
            borderRadius="4px"
          />
        </div>
        <div style={{ padding: '0 16px' }}>
          <SkeletonBlock
            width={40}
            height={40}
            borderRadius="50%"
            className={styles.skeletonAvatar}
          />
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <SkeletonBlock
            width="70%"
            height={20}
            borderRadius="4px"
            style={{ marginBottom: '8px', marginLeft: 'auto' }}
          />
          <SkeletonBlock
            width="40%"
            height={14}
            borderRadius="4px"
            style={{ marginLeft: 'auto' }}
          />
        </div>
      </div>

      {/* Score placeholder - large, center */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <SkeletonBlock
          width="60%"
          height={48}
          borderRadius="4px"
          style={{ margin: '0 auto' }}
        />
      </div>

      {/* Status bar placeholder */}
      <div style={{ textAlign: 'center' }}>
        <SkeletonBlock
          width={80}
          height={24}
          borderRadius="20px"
          className={styles.skeletonPill}
          style={{ margin: '0 auto' }}
        />
      </div>
    </div>
  )
}

export default SkeletonCricketCard
