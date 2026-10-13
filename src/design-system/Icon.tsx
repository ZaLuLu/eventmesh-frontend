import React from 'react'
import * as PhosphorIcons from '@phosphor-icons/react'
import type { IconWeight } from '@phosphor-icons/react'

export type IconName = keyof typeof PhosphorIcons

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name?: string
  size?: number | string
  weight?: IconWeight
  color?: string
  mirrored?: boolean
  className?: string
}

/**
 * Single Unified Icon Wrapper for EventMesh.
 * Uses Phosphor Icons with high-energy "bold" or "duotone" weight by default
 * to match the tactile Campus Funk visual identity.
 */
export const Icon: React.FC<IconProps> = ({
  name = 'Sparkle',
  size = 20,
  weight = 'bold',
  color = 'currentColor',
  className = '',
  ...rest
}) => {
  // Normalize PascalCase name or fallback
  const resolvedName = (name.charAt(0).toUpperCase() + name.slice(1)) as IconName
  const PhosphorComponent = (PhosphorIcons[resolvedName] || PhosphorIcons.Sparkle) as React.ComponentType<any>

  return (
    <PhosphorComponent
      size={size}
      weight={weight}
      color={color}
      className={className}
      {...rest}
    />
  )
}

// Re-export common Phosphor Icons with bold default for direct imports
export * from '@phosphor-icons/react'
