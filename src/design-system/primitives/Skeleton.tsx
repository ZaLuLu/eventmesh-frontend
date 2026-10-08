import React from 'react'

export interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-5',
}) => {
  return (
    <div
      className={`bg-paper-deep animate-pulse ${width} ${height} ${className}`}
      aria-hidden="true"
    />
  )
}
