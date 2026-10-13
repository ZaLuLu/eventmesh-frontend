import { describe, it, expect } from 'vitest'
import { sanitizeCsvCell, formatCsvRow } from './exportCsv'

describe('CSV Sanitization & Export (Audit F-16)', () => {
  it('neutralizes formula injection characters (=, +, -, @)', () => {
    expect(sanitizeCsvCell('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)")
    expect(sanitizeCsvCell('+cmd|/c calc')).toBe("'+cmd|/c calc")
    expect(sanitizeCsvCell('-2+5')).toBe("'-2+5")
    expect(sanitizeCsvCell('@username')).toBe("'@username")
    expect(sanitizeCsvCell('\tmalicious_tab')).toBe("'\tmalicious_tab")
  })

  it('leaves standard strings, numbers and booleans untouched without prefixing', () => {
    expect(sanitizeCsvCell('Aarav Deshmukh')).toBe('Aarav Deshmukh')
    expect(sanitizeCsvCell('aarav@campus.ac.in')).toBe('aarav@campus.ac.in')
    expect(sanitizeCsvCell(250)).toBe('250')
    expect(sanitizeCsvCell(false)).toBe('false')
    expect(sanitizeCsvCell(null)).toBe('')
    expect(sanitizeCsvCell(undefined)).toBe('')
  })

  it('formats rows with quotes and escaped inner quotes', () => {
    const row = {
      name: 'John "Neo" Doe',
      payload: '=cmd|/c calc!A0',
      count: 42,
    }
    const cols = [
      { key: 'name' as const, label: 'Name' },
      { key: 'payload' as const, label: 'Payload' },
      { key: 'count' as const, label: 'Count' },
    ]
    const formatted = formatCsvRow(row, cols)
    expect(formatted).toBe('"John ""Neo"" Doe","\'=cmd|/c calc!A0","42"')
  })
})
