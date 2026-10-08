import React from 'react'

export interface Column<T> {
  key: string
  header: React.ReactNode
  render?: (item: T) => React.ReactNode
  className?: string
  width?: string
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  emptyMessage?: string
  surface?: 'public' | 'admin'
  onRowClick?: (item: T) => void
  className?: string
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found.',
  surface = 'public',
  onRowClick,
  className = '',
}: TableProps<T>) {
  const borderColor = surface === 'admin' ? 'border-admin-border' : 'border-ink-15'
  const hoverColor = surface === 'admin' ? 'hover:bg-black/5' : 'hover:bg-paper-deep'

  return (
    <div className={`w-full overflow-x-auto border ${borderColor} ${className}`}>
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className={`border-b ${borderColor} bg-paper-deep/60`}>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3 px-4 font-mono text-[11px] font-medium uppercase tracking-widecaps text-ink-60 ${
                  col.className || ''
                }`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 px-4 text-center font-mono text-xs text-ink-60 uppercase tracking-wide"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={`border-b ${borderColor} transition-colors duration-150 ${
                  onRowClick ? `cursor-pointer ${hoverColor}` : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3.5 px-4 font-body text-sm text-ink ${
                      col.className || ''
                    }`}
                  >
                    {col.render
                      ? col.render(item)
                      : (item as Record<string, unknown>)[col.key] != null
                      ? String((item as Record<string, unknown>)[col.key])
                      : '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
