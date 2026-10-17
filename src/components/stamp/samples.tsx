import type { StampInvoice, StampIssuer } from './types'

const CAT =
  'M 68.125 148.125 C 71.875 125 82.5 95.625 90.625 67.5 C 93.125 58.75 99.375 56.875 105 64.375 L 126.875 93.75 C 131.25 100 136.875 102.5 144.375 100.625 C 156.875 98.125 168.125 98.75 180 101.875 C 188.125 103.75 193.125 100.625 198.125 94.375 L 220.625 65.625 C 226.25 58.75 232.5 61.25 235.625 70.625 C 245 100.625 256.875 133.125 260 160 C 266.875 216.25 246.875 249.375 205 257.5 C 178.75 263.125 147.5 264.375 121.25 258.125 C 79.375 248.75 58.75 225.625 61.875 186.875 C 63.125 171.875 65.625 160 68.125 148.125 Z M 141.2462 166.1307 A 14 26.24 -8.5 0 1 113.5538 170.2693 A 14 26.24 -8.5 0 1 141.2462 166.1307 Z M 209.5973 171.0761 A 16.88 28.4 10.5 0 1 176.4027 164.9239 A 16.88 28.4 10.5 0 1 209.5973 171.0761 Z'

export const SAMPLE_ISSUER: StampIssuer = {
  name: 'EventMesh Network',
  logo: (
    <div className="w-8 h-8 rounded-lg bg-accent text-white font-display font-extrabold flex items-center justify-center text-sm shadow-xs">
      EM
    </div>
  ),
  details: [
    { label: 'Platform', value: 'EventMesh Collegiate Systems' },
    { label: 'Email', value: 'admissions@eventmesh.ac' },
    { label: 'Web', value: 'eventmesh.ac' },
    { label: 'Registry', value: 'Central Campus Gate Clearance' },
  ],
  payment: [
    { label: 'Gateway', value: 'Cashfree Split Marketplace PG' },
    { label: 'Merchant', value: 'EventMesh India Escrow' },
    { label: 'Account', value: 'AC-EM-992018' },
    { label: 'Status', value: 'Instant Escrow Settlement' },
  ],
  website: 'eventmesh.ac',
}

export const SAMPLE_INVOICES: StampInvoice[] = [
  {
    id: 'FUI-0067',
    client: 'Northwind Pty Ltd',
    total: '$1,572.50',
    issued: '01/09/2026',
    due: '15/09/2026',
    lines: [
      {
        description: 'Component design',
        quantity: '12.00',
        unitPrice: '$85/hour',
        total: '$1,020.00',
      },
      {
        description: 'Motion prototypes',
        quantity: '4.50',
        unitPrice: '$85/hour',
        total: '$382.50',
      },
      { description: 'Figma handoff', quantity: '2.00', unitPrice: '$85/hour', total: '$170.00' },
    ],
  },
  {
    id: 'FUI-0068',
    client: 'Harbour & Pine',
    total: '$1,190.00',
    issued: '03/09/2026',
    due: '17/09/2026',
    lines: [
      { description: 'Brand refresh', quantity: '8.00', unitPrice: '$85/hour', total: '$680.00' },
      { description: 'Icon set', quantity: '6.00', unitPrice: '$85/hour', total: '$510.00' },
    ],
  },
  {
    id: 'FUI-0069',
    client: 'Lumen Coffee Co',
    total: '$935.00',
    issued: '05/09/2026',
    due: '19/09/2026',
    lines: [
      {
        description: 'Menu board layout',
        quantity: '5.00',
        unitPrice: '$85/hour',
        total: '$425.00',
      },
      { description: 'Loyalty card', quantity: '6.00', unitPrice: '$85/hour', total: '$510.00' },
    ],
  },
]
