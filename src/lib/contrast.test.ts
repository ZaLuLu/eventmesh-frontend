import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  getRelativeLuminance,
  getContrastRatio,
  computeOnEventColor,
  getContrastSummary,
  PAPER_HEX,
  INK_HEX,
} from './contrast'

describe('WCAG Luminance and Contrast Calculator', () => {
  it('correctly parses 6-digit and 3-digit hex colors', () => {
    expect(hexToRgb('#11100F')).toEqual({ r: 17, g: 16, b: 15 })
    expect(hexToRgb('#F3EEE9')).toEqual({ r: 243, g: 238, b: 233 })
    expect(hexToRgb('#FFF')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('invalid')).toEqual({ r: 17, g: 16, b: 15 })
  })

  it('calculates correct relative luminance bounds', () => {
    const blackLum = getRelativeLuminance(0, 0, 0)
    const whiteLum = getRelativeLuminance(255, 255, 255)
    expect(blackLum).toBeCloseTo(0, 4)
    expect(whiteLum).toBeCloseTo(1, 4)
  })

  it('computes expected --on-event colors for curated brand palette', () => {
    // Darker colors should choose paper for high contrast
    expect(computeOnEventColor('#2F4BD6')).toBe(PAPER_HEX) // Cobalt
    expect(computeOnEventColor('#1F5F5B')).toBe(PAPER_HEX) // Deep Teal
    expect(computeOnEventColor('#5B2A4A')).toBe(PAPER_HEX) // Plum

    // Very light/bright colors should choose ink for high contrast
    expect(computeOnEventColor('#E3A12F')).toBe(INK_HEX) // Saffron
    expect(computeOnEventColor('#FFFFFF')).toBe(INK_HEX) // White
  })

  it('provides comprehensive summary with WCAG AA/AAA compliance checks', () => {
    const summary = getContrastSummary('#2F4BD6')
    expect(summary.onEventColor).toBe(PAPER_HEX)
    expect(summary.contrastRatio).toBeGreaterThan(4.5)
    expect(summary.isAANormal).toBe(true)
  })
})
