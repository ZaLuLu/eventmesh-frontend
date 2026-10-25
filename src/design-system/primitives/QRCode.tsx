import React, { useEffect, useRef } from 'react'
import QRCodeLib from 'qrcode'

export interface QRCodeProps {
  value: string
  size?: number
  className?: string
  colorDark?: string
  colorLight?: string
}

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 180,
  className = '',
  colorDark = '#1B1A19',
  colorLight = '#FFFFFF',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return
    const dpr = typeof window !== 'undefined' ? Math.max(window.devicePixelRatio || 1, 2) : 2

    QRCodeLib.toCanvas(
      canvasRef.current,
      value,
      {
        width: Math.round(size * dpr),
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: colorDark,
          light: colorLight,
        },
      },
      (error) => {
        if (error) {
          console.error('Failed to generate QR code:', error)
        }
      }
    )
  }, [value, size, colorDark, colorLight])

  return (
    <div
      className={`inline-flex items-center justify-center p-2.5 border border-line rounded-xl bg-white shadow-xs ${className}`}
    >
      <canvas
        ref={canvasRef}
        style={{ width: `${size}px`, height: `${size}px`, imageRendering: 'pixelated' }}
        className="block"
      />
    </div>
  )
}
