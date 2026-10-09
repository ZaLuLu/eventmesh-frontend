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
  keyExtractor?: (item: T, index?: number) => string
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
  const getKey = keyExtractor || ((item: any, i: number) => item.id || item.key || String(i))

  return (
    <div className={`w-full overflow-x-auto border border-line rounded-[10px] bg-surface ${className}`}>
      <table className="w-full text-left border-collapse min-w-[640px]">
        <thead className="sticky top-0 z-10 bg-subtle border-b border-line">
          <tr className="h-[44px]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2 px-4 text-small font-semibold text-text-2 ${
                  col.className || ''
                }`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-[120px] px-4 text-center text-small text-text-3"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr
                key={getKey(item, idx)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={`h-[52px] transition-colors duration-150 hover:bg-subtle ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-2.5 px-4 text-small text-text ${
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
