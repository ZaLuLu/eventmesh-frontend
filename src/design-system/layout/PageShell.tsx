import React from 'react'

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
  /**
   * If true, suppresses standard vertical padding (useful for full-bleed heroes like Landing)
   */
  noPaddingY?: boolean
}

/**
 * Standardized PageShell Container for EventMesh Public Views (Audit V-01).
 * Enforces unified horizontal padding and max-width 1320px across all routes,
 * eliminating the previous edge-touching layout defects.
 */
export const PageShell: React.FC<PageShellProps> = ({
  children,
  className = '',
  as: Component = 'div',
  noPaddingY = false,
  ...props
}) => {
  return (
    <Component
      className={`w-full max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 ${
        noPaddingY ? '' : 'py-8 sm:py-10 md:py-12'
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
