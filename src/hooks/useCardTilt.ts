import { useState, useRef, useCallback } from 'react'

interface TiltState {
  rotateX: number
  rotateY: number
  glareX: number
  glareY: number
  isHovered: boolean
}

/**
 * useCardTilt:
 * Provides smooth 3D perspective tilt and dynamic cursor glare sheen
 * using hardware-accelerated CSS transforms.
 * Inspired by Linear.app and Apple cards. Zero external dependencies.
 */
export function useCardTilt(maxRotation = 8) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const percentX = x / rect.width
      const percentY = y / rect.height

      // Center is (0, 0), range is [-1, 1]
      const centerX = (percentX - 0.5) * 2
      const centerY = (percentY - 0.5) * 2

      // Invert Y for standard natural 3D tilt
      const rotateX = -centerY * maxRotation
      const rotateY = centerX * maxRotation

      setTilt({
        rotateX,
        rotateY,
        glareX: percentX * 100,
        glareY: percentY * 100,
        isHovered: true,
      })
    },
    [maxRotation]
  )

  const handleMouseEnter = useCallback(() => {
    setTilt((prev) => ({ ...prev, isHovered: true }))
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false,
    })
  }, [])

  const style: React.CSSProperties = {
    transform: tilt.isHovered
      ? `perspective(1000px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: tilt.isHovered
      ? 'transform 0.1s ease-out'
      : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
    transformStyle: 'preserve-3d',
  }

  const glareStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    borderRadius: 'inherit',
    opacity: tilt.isHovered ? 0.18 : 0,
    transition: 'opacity 0.3s ease',
    background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.8) 0%, transparent 60%)`,
    zIndex: 20,
  }

  return {
    ref,
    tiltProps: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
    style,
    glareStyle,
    isHovered: tilt.isHovered,
  }
}
