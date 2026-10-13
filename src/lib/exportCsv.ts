/**
 * CSV Export utility with CSV Formula Injection / DDE attack defense (Audit F-16).
 */

/**
 * Sanitizes a cell value to prevent CSV formula injection.
 * Formula triggers (=, +, -, @, tabs) in spreadsheet software (Excel, Sheets)
 * are neutralized by prefixing with a single quote.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value == null) return ''
  let str = typeof value === 'object' ? JSON.stringify(value) : String(value)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`
  }
  return str
}

export function formatCsvRow<T extends Record<string, unknown>>(
  row: T,
  columns: { key: keyof T; label: string }[]
): string {
  return columns
    .map((c) => {
      const sanitized = sanitizeCsvCell(row[c.key])
      return `"${sanitized.replace(/"/g, '""')}"`
    })
    .join(',')
}

export function exportToCSV<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns: { key: keyof T; label: string }[]
) {
  if (!rows || rows.length === 0) return

  const header = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',')

  const body = rows
    .map((row) => formatCsvRow(row, columns))
    .join('\r\n')

  const csvContent = `${header}\r\n${body}`
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
