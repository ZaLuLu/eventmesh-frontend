import { describe, it, expect } from 'vitest'
import { formatNumber, formatCurrency, formatOrdinal } from './format'

describe('Format Utilities (en-IN)', () => {
  it('formats numbers with Indian comma grouping', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(100000)).toBe('1,00,000')
    expect(formatNumber(10000000)).toBe('1,00,00,000')
  })

  it('formats currency correctly in INR', () => {
    const formatted = formatCurrency(500)
    expect(formatted).toContain('500')
    expect(formatted).toMatch(/₹|Rs/)
  })

  it('formats ordinal numbers correctly', () => {
    expect(formatOrdinal(1)).toBe('1st')
    expect(formatOrdinal(2)).toBe('2nd')
    expect(formatOrdinal(3)).toBe('3rd')
    expect(formatOrdinal(4)).toBe('4th')
    expect(formatOrdinal(21)).toBe('21st')
    expect(formatOrdinal(22)).toBe('22nd')
    expect(formatOrdinal(23)).toBe('23rd')
    expect(formatOrdinal(24)).toBe('24th')
  })
})
