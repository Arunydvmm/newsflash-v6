import React from 'react'
import styles from '@/styles/skeleton.module.css'

interface SkeletonBlockProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
  style?: React.CSSProperties
}

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width = '100%',
  height = '100%',
  borderRadius = '4px',
  className = '',
  style = {}
}) => {
  const combinedStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    ...style
  }

  return (
    <div
      className={`${styles.skeletonBase} ${className}`}
      style={combinedStyle}
      aria-hidden="true"
    />
  )
}

export default SkeletonBlock
