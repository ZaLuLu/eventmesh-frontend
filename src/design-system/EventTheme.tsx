import React from 'react'
import { useEventTheme } from '@/hooks/useEventTheme'

interface EventThemeProps {
  color?: string
  className?: string
  style?: React.CSSProperties
  as?: React.ElementType
  children: React.ReactNode
}

export const EventTheme: React.FC<EventThemeProps> = ({
  color = '#C66A4A',
  className = '',
  style = {},
  as: Component = 'div',
  children,
}) => {
  const { style: themeStyle } = useEventTheme(color)

  return (
    <Component
      className={className}
      style={{
        ...themeStyle,
        ...style,
      }}
    >
      {children}
    </Component>
  )
}
