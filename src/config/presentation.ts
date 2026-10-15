/** Presentation-only rollout switches; never gate permissions or data correctness. */
export const PRESENTATION = {
  enterpriseDiscovery: import.meta.env.VITE_ENTERPRISE_DISCOVERY !== 'false',
} as const
