import { test } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 740 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'phone-landscape', width: 844, height: 390 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'wide-1920', width: 1920, height: 1080 },
]

const ROUTES = ['/', '/explore', '/styleguide', '/admin']
const outDir = path.resolve('tests/visual-snapshots')
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

test.describe('Visual Breakpoints Verification & Snapshotting', () => {
  for (const vp of VIEWPORTS) {
    test(`Capture snapshots at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })

      for (const route of ROUTES) {
        const routeName = route === '/' ? 'home' : route.replace('/', '')
        await page.goto(route, { waitUntil: 'domcontentloaded' })
        await page.waitForTimeout(400)
        const filePath = path.join(outDir, `${vp.name}-${routeName}.png`)
        await page.screenshot({ path: filePath })
      }
    })
  }
})
