const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader']
  });

  const outDir = path.resolve(__dirname, '../visual-snapshots-after');

  // 1. Event Detail - Desktop 1440px
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/events/grand-turing-hackathon-2026', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'step-e5-event-detail-1440.png'), fullPage: true });
    await context.close();
  }

  // 2. Event Detail - Mobile 390px
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/events/grand-turing-hackathon-2026', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'step-e5-event-detail-390.png'), fullPage: true });
    await context.close();
  }

  // 3. Register Page - Desktop 1440px
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/events/grand-turing-hackathon-2026/register', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'step-e5-register-1440.png'), fullPage: true });
    await context.close();
  }

  // 4. Register Page - Mobile 390px
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/events/grand-turing-hackathon-2026/register', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'step-e5-register-390.png'), fullPage: true });
    await context.close();
  }

  await browser.close();
  console.log('Step E.5 Event Detail and Register snapshots captured successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
