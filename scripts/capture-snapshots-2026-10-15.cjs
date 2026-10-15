const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function main() {
  const outDir = path.resolve(__dirname, '../snapshots-2026-10-15');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`Starting snapshot capture for 2026-10-15 into ${outDir}...`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader']
  });

  const routes = [
    { name: '01-home-hero-desktop', url: 'http://127.0.0.1:5173/', viewport: { width: 1440, height: 900 }, fullPage: false },
    { name: '02-home-full-desktop', url: 'http://127.0.0.1:5173/', viewport: { width: 1440, height: 900 }, fullPage: true },
    { name: '03-home-mobile', url: 'http://127.0.0.1:5173/', viewport: { width: 390, height: 844 }, fullPage: true },
    { name: '04-explore-desktop', url: 'http://127.0.0.1:5173/explore', viewport: { width: 1440, height: 900 }, fullPage: false },
    { name: '05-explore-full-desktop', url: 'http://127.0.0.1:5173/explore', viewport: { width: 1440, height: 900 }, fullPage: true },
    { name: '06-event-detail-desktop', url: 'http://127.0.0.1:5173/events/grand-turing-hackathon-2026', viewport: { width: 1440, height: 900 }, fullPage: false },
    { name: '07-event-detail-full-desktop', url: 'http://127.0.0.1:5173/events/grand-turing-hackathon-2026', viewport: { width: 1440, height: 900 }, fullPage: true },
    { name: '08-clubs-desktop', url: 'http://127.0.0.1:5173/clubs', viewport: { width: 1440, height: 900 }, fullPage: false },
    { name: '09-calendar-desktop', url: 'http://127.0.0.1:5173/schedule', viewport: { width: 1440, height: 900 }, fullPage: false },
    { name: '10-announcements-desktop', url: 'http://127.0.0.1:5173/announcements', viewport: { width: 1440, height: 900 }, fullPage: false },
    { name: '11-about-desktop', url: 'http://127.0.0.1:5173/about', viewport: { width: 1440, height: 900 }, fullPage: false },
    { name: '12-gallery-desktop', url: 'http://127.0.0.1:5173/gallery', viewport: { width: 1440, height: 900 }, fullPage: false },
    { name: '13-dashboard-lanyard-desktop', url: 'http://127.0.0.1:5173/attendee/dashboard', viewport: { width: 1440, height: 900 }, fullPage: false },
    { name: '14-login-desktop', url: 'http://127.0.0.1:5173/login', viewport: { width: 1440, height: 900 }, fullPage: false },
    { name: '15-styleguide-desktop', url: 'http://127.0.0.1:5173/styleguide', viewport: { width: 1440, height: 900 }, fullPage: true },
    { name: '16-admin-checkin-desktop', url: 'http://127.0.0.1:5173/admin/checkin', viewport: { width: 1440, height: 900 }, fullPage: false }
  ];

  for (const route of routes) {
    const context = await browser.newContext({
      viewport: route.viewport,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    try {
      await page.goto(route.url, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1000);
      const outPath = path.join(outDir, `${route.name}.png`);
      await page.screenshot({ path: outPath, fullPage: route.fullPage });
      console.log(`✓ Captured: ${route.name} -> ${outPath}`);
    } catch (e) {
      console.error(`✗ Failed to capture ${route.name}:`, e.message);
    } finally {
      await context.close();
    }
  }

  // Capture Mobile Nav Drawer open state
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    try {
      await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(800);
      const menuBtn = page.getByRole('button', { name: /open navigation/i });
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
        await page.waitForTimeout(500);
      }
      const outPath = path.join(outDir, `17-home-mobile-nav-drawer.png`);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`✓ Captured: 17-home-mobile-nav-drawer -> ${outPath}`);
    } catch (e) {
      console.error('✗ Failed to capture mobile nav drawer:', e.message);
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
      await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 20000 });
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      });
      await page.waitForTimeout(800);
      const outPath = path.join(outDir, `18-home-dark-mode-desktop.png`);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`✓ Captured: 18-home-dark-mode-desktop -> ${outPath}`);
    } catch (e) {
      console.error('✗ Failed to capture dark mode:', e.message);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log(`\n🎉 All snapshots successfully saved to ${outDir}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
