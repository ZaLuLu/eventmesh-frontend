import React, { useRef, useEffect } from 'react'

export interface CelestialAuroraMeshProps {
  className?: string
  opacity?: number
  speed?: number
}

/**
 * CelestialAuroraMesh:
 * A bespoke 60fps hardware-accelerated generative Aurora Canvas backdrop.
 * Renders undulating harmonic waveforms, cosmic dust motes, and soft chromatic light veils.
 * Respects `prefers-reduced-motion` and pauses when offscreen or hidden.
 */
export const CelestialAuroraMesh: React.FC<CelestialAuroraMeshProps> = ({
  className = '',
  opacity = 0.65,
  speed = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let isVisible = true
    let width = 0
    let height = 0

    // Handle device pixel ratio for crystal clear rendering
    const resize = () => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    // Reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // IntersectionObserver to avoid rendering when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting && !document.hidden
      },
      { threshold: 0.05 }
    )
    observer.observe(canvas)

    const handleVisibility = () => {
      isVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Star / mote particles
    const stars = Array.from({ length: 32 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.2,
      speed: (Math.random() * 0.0003 + 0.0001) * speed,
    }))

    let startTime = performance.now()

    const render = (now: number) => {
      if (!isVisible || prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const elapsed = (now - startTime) * 0.001 * speed

      // Clear with transparent
      ctx.clearRect(0, 0, width, height)

      // 1. Base Aurora Veils (Composite 'screen' for luminescent light mixing)
      ctx.save()
      ctx.globalCompositeOperation = 'screen'

      // Ribbon 1: Royal Electric Indigo Veil
      const r1Y = height * 0.45 + Math.sin(elapsed * 0.4) * height * 0.12
      const grad1 = ctx.createRadialGradient(
        width * 0.65 + Math.cos(elapsed * 0.3) * width * 0.15,
        r1Y,
        width * 0.05,
        width * 0.65,
        r1Y,
        width * 0.6
      )
      grad1.addColorStop(0, 'rgba(79, 70, 229, 0.45)') // Indigo
      grad1.addColorStop(0.5, 'rgba(124, 58, 237, 0.25)') // Purple
      grad1.addColorStop(1, 'rgba(15, 17, 35, 0)')
      ctx.fillStyle = grad1
      ctx.fillRect(0, 0, width, height)

      // Ribbon 2: Ethereal Lavender / Ultraviolet Arc
      const r2X = width * 0.3 + Math.sin(elapsed * 0.35 + 1.2) * width * 0.15
      const r2Y = height * 0.35 + Math.cos(elapsed * 0.5) * height * 0.1
      const grad2 = ctx.createRadialGradient(
        r2X,
        r2Y,
        width * 0.02,
        r2X,
        r2Y,
        width * 0.45
      )
      grad2.addColorStop(0, 'rgba(192, 132, 252, 0.4)') // Soft Lavender
      grad2.addColorStop(0.6, 'rgba(147, 51, 234, 0.18)')
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad2
      ctx.fillRect(0, 0, width, height)

      // Ribbon 3: Amber Coral Sunrise Accent (Bottom Edge warmth)
      const r3X = width * 0.8 + Math.cos(elapsed * 0.25) * width * 0.1
      const r3Y = height * 0.75 + Math.sin(elapsed * 0.45) * height * 0.1
      const grad3 = ctx.createRadialGradient(
        r3X,
        r3Y,
        width * 0.01,
        r3X,
        r3Y,
        width * 0.38
      )
      grad3.addColorStop(0, 'rgba(244, 114, 182, 0.32)') // Rose Pink
      grad3.addColorStop(0.5, 'rgba(239, 68, 68, 0.15)') // Warm Coral
      grad3.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad3
      ctx.fillRect(0, 0, width, height)

      // 2. Harmonic Undulating Sine Waves
      ctx.lineWidth = 1.2
      for (let waveIdx = 0; waveIdx < 2; waveIdx++) {
        ctx.beginPath()
        const waveBaseY = height * (0.42 + waveIdx * 0.18)
        const waveFreq = 0.003 - waveIdx * 0.0008
        const waveAmp = 28 + waveIdx * 14
        const wavePhase = elapsed * (0.8 + waveIdx * 0.3)

        ctx.moveTo(0, waveBaseY)
        for (let x = 0; x <= width; x += 12) {
          const y = waveBaseY + Math.sin(x * waveFreq + wavePhase) * waveAmp
          ctx.lineTo(x, y)
        }
        ctx.strokeStyle =
          waveIdx === 0
            ? 'rgba(192, 132, 252, 0.12)'
            : 'rgba(99, 102, 241, 0.09)'
        ctx.stroke()
      }

      ctx.restore()

      // 3. Starlight / Cosmic Dust Motes
      ctx.save()
      for (const s of stars) {
        s.y -= s.speed
        if (s.y < 0) s.y = 1
        const sx = s.x * width
        const sy = s.y * height
        const twinkle = Math.sin(elapsed * 2 + s.x * 20) * 0.3 + 0.7
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * twinkle * 0.6})`
        ctx.beginPath()
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
      observer.disconnect()
    }
  }, [speed])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  )
}
