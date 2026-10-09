import { test, expect } from '@playwright/test'

const VIEWPORTS = [
  { width: 360, height: 740, name: 'mobile-360' },
  { width: 768, height: 1024, name: 'tablet-768' },
  { width: 1280, height: 900, name: 'desktop-1280' },
  { width: 1920, height: 1080, name: 'wide-1920' },
]

const PUBLIC_ROUTES = [
  '/',
  '/explore',
  '/clubs',
  '/calendar',
  '/announcements',
  '/about',
  '/gallery',
  '/styleguide',
]

test.describe('Automated Layout & Responsiveness Audit', () => {
  for (const vp of VIEWPORTS) {
    test.describe(`Viewport: ${vp.name} (${vp.width}px)`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } })

      for (const route of PUBLIC_ROUTES) {
        test(`Audit ${route} layout integrity`, async ({ page }) => {
          await page.goto(route, { waitUntil: 'domcontentloaded' })
          await page.waitForTimeout(600) // Allow async query data to render

          // 1. Check: No horizontal page scroll
          const scrollInfo = await page.evaluate(() => {
            return {
              scrollWidth: document.documentElement.scrollWidth,
              clientWidth: document.documentElement.clientWidth,
              bodyScrollWidth: document.body.scrollWidth,
              bodyClientWidth: document.body.clientWidth,
            }
          })


          expect(
            scrollInfo.scrollWidth,
            `Horizontal scroll detected on ${route} at ${vp.width}px: scrollWidth (${scrollInfo.scrollWidth}) > clientWidth (${scrollInfo.clientWidth})`
          ).toBeLessThanOrEqual(scrollInfo.clientWidth + 1)

          // 2. Check: No vertical gap between consecutive top-level sections exceeds 64px
          const gapViolations = await page.evaluate(() => {
            const sections = Array.from(
              document.querySelectorAll(
                'main > section, main > div > section, .app-container > section, section'
              )
            ).filter((el) => {
              const rect = el.getBoundingClientRect()
              const style = window.getComputedStyle(el)
              return (
                rect.height > 10 &&
                rect.width > 10 &&
                style.display !== 'none' &&
                style.visibility !== 'hidden'
              )
            })

            const sorted = sections
              .map((el) => {
                const rect = el.getBoundingClientRect()
                const top = rect.top + window.scrollY
                const bottom = rect.bottom + window.scrollY
                const height = rect.height
                return { el, top, bottom, height, tag: el.tagName, class: el.className }
              })
              .sort((a, b) => a.top - b.top)

            // Filter out nested sub-sections
            const topLevel = sorted.filter((s, idx) => {
              return !sorted.some(
                (other, oIdx) =>
                  oIdx !== idx &&
                  other.top <= s.top + 1 &&
                  other.bottom >= s.bottom - 1 &&
                  other.height > s.height
              )
            })

            const violations: Array<{ prev: string; curr: string; gap: number }> = []
            for (let i = 1; i < topLevel.length; i++) {
              const prev = topLevel[i - 1]
              const curr = topLevel[i]
              // Check if they are stacked consecutively
              if (curr.top >= prev.bottom - 2) {
                const gap = curr.top - prev.bottom
                if (gap > 64.5) {
                  violations.push({
                    prev: `<${prev.tag.toLowerCase()} class="${prev.class.slice(0, 30)}">`,
                    curr: `<${curr.tag.toLowerCase()} class="${curr.class.slice(0, 30)}">`,
                    gap: Math.round(gap),
                  })
                }
              }
            }
            return violations
          })

          expect(
            gapViolations,
            `Section gap exceeding 64px detected on ${route} at ${vp.width}px`
          ).toEqual([])

          // 3. Check: No section is taller than 1.5 viewport heights while mostly empty
          const tallEmptyViolations = await page.evaluate(() => {
            const vh = window.innerHeight
            const sections = Array.from(document.querySelectorAll('section, main > div')).filter(
              (el) => {
                const rect = el.getBoundingClientRect()
                return rect.height > 1.5 * vh
              }
            )

            const violations: Array<{ tag: string; height: number; textLength: number }> = []
            for (const el of sections) {
              const rect = el.getBoundingClientRect()
              const text = (el as HTMLElement).innerText?.trim() || ''
              if (text.length < 80) {
                violations.push({
                  tag: `${el.tagName}.${el.className.slice(0, 30)}`,
                  height: Math.round(rect.height),
                  textLength: text.length,
                })
              }
            }
            return violations
          })

          expect(
            tallEmptyViolations,
            `Section taller than 1.5vh while mostly empty found on ${route} at ${vp.width}px`
          ).toEqual([])
        })
      }

      // Admin routes audit
      test(`Audit Admin Console layout integrity`, async ({ page }) => {
        // Authenticate via Dev Accounts
        await page.goto('/dev/accounts')
        const adminBtn = page.getByRole('button', { name: /DevCraft Lead|Platform Admin/i }).first()
        await adminBtn.click()
        await page.waitForURL(/\/admin/)

        for (const adminRoute of ['/admin', '/admin/events']) {
          await page.goto(adminRoute, { waitUntil: 'domcontentloaded' })
          await page.waitForTimeout(500)

          const scrollInfo = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }))

          expect(
            scrollInfo.scrollWidth,
            `Horizontal scroll on ${adminRoute} at ${vp.width}px`
          ).toBeLessThanOrEqual(scrollInfo.clientWidth + 1)
        }
      })
    })
  }
})
