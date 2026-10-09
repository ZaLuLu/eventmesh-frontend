import React from 'react'

export interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  rounded?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-5',
  rounded = 'rounded-[8px]',
}) => {
  return (
    <div
      className={`bg-subtle animate-pulse ${rounded} ${width} ${height} ${className}`}
      style={{ animationDuration: '2s' }}
      aria-hidden="true"
    />
  )
}
