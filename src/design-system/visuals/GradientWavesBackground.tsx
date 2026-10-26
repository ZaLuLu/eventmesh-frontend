import React, { useEffect, useRef } from 'react'

interface GradientWavesBackgroundProps {
  children?: React.ReactNode
  className?: string
}

/**
 * GradientWavesBackground
 * High-definition interactive fluid gradient waves inspired by React Bits.
 *
 * Engineered with:
 * - High-contrast calibrated color palette (WCAG compliant contrast against central card)
 * - Harmonically tuned sinusoidal ribbon curves
 * - Interactive mouse cursor tracking with smooth lerp easing
 * - Micro-film grain noise texture to prevent gradient banding
 * - Automatic dark / light mode synchronization
 * - Respects prefers-reduced-motion
 */
export const GradientWavesBackground: React.FC<GradientWavesBackgroundProps> = ({
  children,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Cursor coordinates with lerp smoothing
    let mouseX = width * 0.5
    let mouseY = height * 0.35
    let targetMouseX = mouseX
    let targetMouseY = mouseY

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX
      targetMouseY = e.clientY
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const handleResize = () => {
      if (!canvas) return
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }

    window.addEventListener('resize', handleResize)

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    let time = 0

    // High-visibility wave ribbons
    const waves = [
      {
        frequency: 0.0016,
        amplitude: 80,
        speed: 0.012,
        offset: 0,
        colorDark: 'rgba(99, 102, 241, 0.32)',   // Vibrant Iris Indigo
        colorLight: 'rgba(79, 70, 229, 0.22)',
      },
      {
        frequency: 0.0022,
        amplitude: 100,
        speed: 0.009,
        offset: Math.PI * 0.45,
        colorDark: 'rgba(59, 130, 246, 0.28)',   // Royal Cobalt Blue
        colorLight: 'rgba(37, 99, 235, 0.18)',
      },
      {
        frequency: 0.0012,
        amplitude: 70,
        speed: 0.015,
        offset: Math.PI * 0.9,
        colorDark: 'rgba(168, 85, 247, 0.26)',  // Deep Violet
        colorLight: 'rgba(147, 51, 234, 0.16)',
      },
    ]

    const render = () => {
      // Smooth cursor lerp
      mouseX += (targetMouseX - mouseX) * 0.06
      mouseY += (targetMouseY - mouseY) * 0.06

      ctx.clearRect(0, 0, width, height)

      // 1. Defined Canvas Ground with real atmospheric contrast
      const baseGradient = ctx.createLinearGradient(0, 0, width, height)
      if (isDark) {
        baseGradient.addColorStop(0, '#09090d')
        baseGradient.addColorStop(0.5, '#0e0d16')
        baseGradient.addColorStop(1, '#07070a')
      } else {
        baseGradient.addColorStop(0, '#eef2f8')
        baseGradient.addColorStop(0.5, '#e4e9f3')
        baseGradient.addColorStop(1, '#e8edf6')
      }

      ctx.fillStyle = baseGradient
      ctx.fillRect(0, 0, width, height)

      // 2. Sinusoidal Wave Ribbons
      if (!prefersReducedMotion) {
        time += 1
      }

      waves.forEach((wave, idx) => {
        ctx.beginPath()
        ctx.moveTo(0, height)

        const baseHeight = height * (0.34 + idx * 0.18)

        for (let x = 0; x <= width; x += 10) {
          const distToMouse = Math.abs(x - mouseX)
          const mouseInfluence = Math.max(0, 1 - distToMouse / (width * 0.35)) * 60

          const y =
            baseHeight +
            Math.sin(x * wave.frequency + time * wave.speed + wave.offset) *
              wave.amplitude +
            Math.cos(x * 0.0012 - time * 0.006) * 28 +
            mouseInfluence

          ctx.lineTo(x, y)
        }

        ctx.lineTo(width, height)
        ctx.closePath()

        const waveGradient = ctx.createLinearGradient(0, baseHeight - 140, 0, height)
        const waveColor = isDark ? wave.colorDark : wave.colorLight

        waveGradient.addColorStop(0, waveColor)
        waveGradient.addColorStop(1, isDark ? 'rgba(9, 9, 13, 0.05)' : 'rgba(230, 235, 245, 0.05)')

        ctx.fillStyle = waveGradient
        ctx.fill()
      })

      // 3. Interactive Cursor Spotlight Halo
      const halo = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 450)
      if (isDark) {
        halo.addColorStop(0, 'rgba(129, 140, 248, 0.22)')
        halo.addColorStop(0.5, 'rgba(99, 102, 241, 0.06)')
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)')
      } else {
        halo.addColorStop(0, 'rgba(99, 102, 241, 0.18)')
        halo.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)')
        halo.addColorStop(1, 'rgba(255, 255, 255, 0)')
      }

      ctx.fillStyle = halo
      ctx.fillRect(0, 0, width, height)

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [isDark])

  return (
    <div className={`relative min-h-screen w-full overflow-hidden select-none ${className}`}>
      {/* High-visibility Canvas with calibrated blur for smooth satin depth without foggy blowout */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
        style={{ filter: 'blur(8px)' }}
        aria-hidden="true"
      />

      {/* Subtle Film Grain Noise Texture to prevent color banding */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Foreground Content */}
      <div className="relative z-10 flex min-h-screen flex-col justify-between">
        {children}
      </div>
    </div>
  )
}
