import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const AUDIT_ROUTES = [
  { name: 'Home', url: '/' },
  { name: 'Explore', url: '/explore' },
  { name: 'Event Detail', url: '/events/neural-frontiers-symposium-2026' },
  { name: 'Clubs Catalog', url: '/clubs' },
  { name: 'Club Detail', url: '/clubs/cp-club' },
  { name: 'Calendar', url: '/calendar' },
  { name: 'Gallery', url: '/gallery' },
  { name: 'Announcements', url: '/announcements' },
  { name: 'Verify Certificate', url: '/verify/TA-2026-001245' },
  { name: 'Attendee Dashboard', url: '/attendee/dashboard' },
  { name: 'Admin Dashboard', url: '/admin' },
  { name: 'Admin Check-in', url: '/admin/checkin' },
]

test.describe('Accessibility Audit (@axe-core/playwright)', () => {
  for (const route of AUDIT_ROUTES) {
    test(`A11y compliance for ${route.name} (${route.url})`, async ({ page }) => {
      await page.goto(route.url, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(600)

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .disableRules(['color-contrast']) // Color contrast checked independently via WCAG matrix in src/lib/contrast.ts
        .analyze()

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      )

      if (criticalViolations.length > 0) {
        console.error(
          `A11y critical/serious violations on ${route.url}:`,
          JSON.stringify(criticalViolations.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })), null, 2)
        )
      }

      expect(criticalViolations).toEqual([])
    })
  }
})
