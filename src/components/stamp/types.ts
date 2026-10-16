export type StampStatus =
  | 'paid'
  | 'received'
  | 'approved'
  | 'due'
  | 'admitted'
  | 'verified'
  | 'void'

export type StampInk = 'red' | 'blue' | 'green' | 'violet' | 'graphite'

export interface PrintData {
  status: StampStatus
  dateText?: string
  ink?: StampInk
  seed?: number
  rotate?: number
  dx?: number
  dy?: number
  subtitle?: string
}

export const STAMP_INKS: Record<StampInk, { name: string; color: string; border: string }> = {
  red: { name: 'Crimson Red', color: '#D8342B', border: '#C02921' },
  blue: { name: 'Cobalt Blue', color: '#2463D6', border: '#1D53B5' },
  green: { name: 'Emerald Green', color: '#16A34A', border: '#15803D' },
  violet: { name: 'Iris Violet', color: '#7C3AED', border: '#6D28D9' },
  graphite: { name: 'Graphite Black', color: '#374151', border: '#1F2937' },
}

export const STATUS_WORDS: Record<StampStatus, { word: string; defaultInk: StampInk }> = {
  paid: { word: 'PAID', defaultInk: 'red' },
  admitted: { word: 'ADMITTED', defaultInk: 'green' },
  verified: { word: 'VERIFIED', defaultInk: 'violet' },
  approved: { word: 'APPROVED', defaultInk: 'blue' },
  received: { word: 'RECEIVED', defaultInk: 'green' },
  due: { word: 'DUE', defaultInk: 'red' },
  void: { word: 'VOID', defaultInk: 'graphite' },
}
