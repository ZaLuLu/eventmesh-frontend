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
  colorDark = '#11100F',
  colorLight = '#F3EEE9',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return

    QRCodeLib.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 1,
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
      className={`inline-flex items-center justify-center p-2 border border-ink-15 bg-paper ${className}`}
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  )
}
