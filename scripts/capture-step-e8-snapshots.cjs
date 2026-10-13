const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const TARGET_DIR = path.join(__dirname, '../visual-snapshots-after')
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true })
}

const PAGES = [
  { name: 'admin-dashboard', url: 'http://127.0.0.1:5173/admin' },
  { name: 'admin-events', url: 'http://127.0.0.1:5173/admin/events' },
  { name: 'admin-registrations', url: 'http://127.0.0.1:5173/admin/registrations' },
  { name: 'admin-checkin', url: 'http://127.0.0.1:5173/admin/checkin' },
]

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
  })

  for (const pageDef of PAGES) {
    // 1440 Desktop
    const contextDesktop = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2
    })
    const pageDesktop = await contextDesktop.newPage()
    try {
      await pageDesktop.goto(pageDef.url, { waitUntil: 'networkidle', timeout: 15000 })
      await pageDesktop.waitForTimeout(1000)
      const outPathDesktop = path.join(TARGET_DIR, `step-e8-${pageDef.name}-1440.png`)
      await pageDesktop.screenshot({ path: outPathDesktop, fullPage: false })
      console.log(`Saved: ${outPathDesktop}`)
    } catch (e) {
      console.error(`Error capturing 1440 for ${pageDef.name}:`, e.message)
    }
    await contextDesktop.close()

    // 390 Mobile
    const contextMobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2
    })
    const pageMobile = await contextMobile.newPage()
    try {
      await pageMobile.goto(pageDef.url, { waitUntil: 'networkidle', timeout: 15000 })
      await pageMobile.waitForTimeout(1000)
      const outPathMobile = path.join(TARGET_DIR, `step-e8-${pageDef.name}-390.png`)
      await pageMobile.screenshot({ path: outPathMobile, fullPage: false })
      console.log(`Saved: ${outPathMobile}`)
    } catch (e) {
      console.error(`Error capturing 390 for ${pageDef.name}:`, e.message)
    }
    await contextMobile.close()
  }

  await browser.close()
  console.log('Admin Step E.8 capture complete!')
}

run()
