/**
 * CSV Export utility
 */

export function exportToCSV<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns: { key: keyof T; label: string }[]
) {
  if (!rows || rows.length === 0) return

  const header = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',')

  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const val = row[c.key]
          if (val == null) return '""'
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
          return `"${str.replace(/"/g, '""')}"`
        })
        .join(',')
    )
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
