/**
 * EventMesh Locale and Number Formatting Utilities
 * Standardizes en-IN locale output for numbers, currency, and percentages.
 */

const NUMBER_FORMATTER = new Intl.NumberFormat('en-IN')

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function formatNumber(value: number): string {
  return NUMBER_FORMATTER.format(value)
}

export function formatCurrency(amount: number): string {
  return CURRENCY_FORMATTER.format(amount)
}

export function formatOrdinal(n: number): string {
  const pr = new Intl.PluralRules('en-IN', { type: 'ordinal' })
  const suffixes: Record<string, string> = {
    one: 'st',
    two: 'nd',
    few: 'rd',
    other: 'th',
  }
  return `${n}${suffixes[pr.select(n)] || 'th'}`
}
