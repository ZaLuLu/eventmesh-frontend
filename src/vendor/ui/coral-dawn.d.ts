declare module '@/vendor/ui/coral-dawn' {
  import React from 'react'
  export interface CoralDawnProps {
    className?: string
    speed?: number
    paused?: boolean
    style?: React.CSSProperties
    [key: string]: any
  }
  const CoralDawn: React.FC<CoralDawnProps>
  export default CoralDawn
  export const paintRecipe: any
}
