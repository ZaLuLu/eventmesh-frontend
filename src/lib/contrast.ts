/**
 * EventMesh WCAG 2.1 Relative Luminance & Automatic Contrast Calculator
 * Ports the mathematical engine from home-mockup/app.js with strict TypeScript types.
 */

export interface RgbColor {
  r: number
  g: number
  b: number
}

export const PAPER_HEX = '#F3EEE9'
export const INK_HEX = '#11100F'

/**
 * Parses 3-character or 6-character hex strings into RGB integer components.
 */
export function hexToRgb(hex: string): RgbColor {
  const clean = hex.replace('#', '').trim()
  const expanded =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean

  const intVal = parseInt(expanded, 16)
  if (isNaN(intVal) || expanded.length !== 6) {
    // Default safe fallback if invalid hex
    return { r: 17, g: 16, b: 15 }
  }

  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  }
}

/**
 * Converts sRGB channel (0-255) to linear light value.
 */
export function sRgbToLinear(channel: number): number {
  const norm = channel / 255
  return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4)
}

/**
 * Computes WCAG 2.1 relative luminance for RGB components.
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  return (
    0.2126 * sRgbToLinear(r) +
    0.7152 * sRgbToLinear(g) +
    0.0722 * sRgbToLinear(b)
  )
}

/**
 * Calculates WCAG 2.1 contrast ratio between two luminance values (1 to 21).
 */
export function getContrastRatioFromLuminance(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Calculates WCAG 2.1 contrast ratio between any two hex colors.
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)
  return Number(getContrastRatioFromLuminance(lum1, lum2).toFixed(2))
}

/**
 * Computes --on-event automatically against --paper (#F3EEE9) and --ink (#11100F).
 * Returns whichever provides higher contrast ratio (targeting >= 4.5:1).
 */
export function computeOnEventColor(eventHex: string): string {
  try {
    const { r, g, b } = hexToRgb(eventHex)
    const eventLum = getRelativeLuminance(r, g, b)

    const inkRgb = hexToRgb(INK_HEX)
    const inkLum = getRelativeLuminance(inkRgb.r, inkRgb.g, inkRgb.b)

    const paperRgb = hexToRgb(PAPER_HEX)
    const paperLum = getRelativeLuminance(paperRgb.r, paperRgb.g, paperRgb.b)

    const contrastWithPaper = getContrastRatioFromLuminance(eventLum, paperLum)
    const contrastWithInk = getContrastRatioFromLuminance(eventLum, inkLum)

    return contrastWithPaper >= contrastWithInk ? PAPER_HEX : INK_HEX
  } catch {
    return INK_HEX
  }
}

export interface ContrastSummary {
  eventColor: string
  onEventColor: string
  contrastRatio: number
  contrastWithPaper: number
  contrastWithInk: number
  isAALarge: boolean
  isAANormal: boolean
  isAAALarge: boolean
  isAAANormal: boolean
}

/**
 * Returns full contrast evaluation for display in club editor and styleguide.
 */
export function getContrastSummary(eventHex: string): ContrastSummary {
  const onEvent = computeOnEventColor(eventHex)
  const contrastRatio = getContrastRatio(eventHex, onEvent)
  const contrastWithPaper = getContrastRatio(eventHex, PAPER_HEX)
  const contrastWithInk = getContrastRatio(eventHex, INK_HEX)

  return {
    eventColor: eventHex,
    onEventColor: onEvent,
    contrastRatio,
    contrastWithPaper,
    contrastWithInk,
    isAALarge: contrastRatio >= 3.0,
    isAANormal: contrastRatio >= 4.5,
    isAAALarge: contrastRatio >= 4.5,
    isAAANormal: contrastRatio >= 7.0,
  }
}
