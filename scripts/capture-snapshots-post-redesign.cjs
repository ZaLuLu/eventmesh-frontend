const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const outDir = path.resolve(__dirname, '../snapshots-post-redesign-2026-10-14');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader']
  });

  const routes = [
    { name: '01-home-hero-desktop', url: 'http://127.0.0.1:5173/', viewport: { width: 1440, height: 900 }, fullPage: false },
    { name: '02-home-full-desktop', url: 'http://127.0.0.1:5173/', viewport: { width: 1440, height: 900 }, fullPage: true },
    { name: '03-home-mobile', url: 'http://127.0.0.1:5173/', viewport: { width: 390, height: 844 }, fullPage: true },
    { name: '04-explore-desktop', url: 'http://127.0.0.1:5173/explore', viewport: { width: 1440, height: 900 }, fullPage: false },
    { name: '05-clubs-desktop', url: 'http://127.0.0.1:5173/clubs', viewport: { width: 1440, height: 900 }, fullPage: false },
    { name: '06-dashboard-lanyard-desktop', url: 'http://127.0.0.1:5173/attendee/dashboard', viewport: { width: 1440, height: 900 }, fullPage: false },
  ];

  for (const route of routes) {
    const context = await browser.newContext({
      viewport: route.viewport,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    try {
      await page.goto(route.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);
      const outPath = path.join(outDir, `${route.name}.png`);
      await page.screenshot({ path: outPath, fullPage: route.fullPage });
      console.log(`Captured: ${route.name} -> ${outPath}`);
    } catch (e) {
      console.error(`Failed to capture ${route.name}:`, e.message);
    } finally {
      await context.close();
    }
  }

  // Also capture Dark Mode version of Homepage
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    try {
      await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      });
      await page.waitForTimeout(1000);
      const outPath = path.join(outDir, `07-home-dark-mode-desktop.png`);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Captured: 07-home-dark-mode-desktop -> ${outPath}`);
    } catch (e) {
      console.error('Failed to capture dark mode:', e.message);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log(`\nAll post-redesign snapshots successfully saved to ${outDir}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
