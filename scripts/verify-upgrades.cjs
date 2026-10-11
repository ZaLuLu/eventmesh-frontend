const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  // Inject session into mock store key
  await context.addInitScript(() => {
    localStorage.setItem(
      'eventmesh_mock_session',
      JSON.stringify({
        id: 'usr-att',
        name: 'Aditya Narayan (Registered Attendee)',
        email: 'attendee@example.com',
        role: 'attendee',
        orgId: 'org-1',
      })
    );
  });

  const page = await context.newPage();
  const outDir = '/home/wafiq/.gemini/antigravity-ide/brain/c3d87ab1-c779-4750-8ec5-38b43b5abfeb/screenshots_upgraded';

  console.log('Navigating to Attendee Dashboard (as usr-att)...');
  await page.goto('http://localhost:5173/attendee/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, '05_upgraded_attendee_wallet.png') });

  // Click "Present Pass" on first ticket
  const presentPassBtn = page.locator('button:has-text("Present Pass")').first();
  if (await presentPassBtn.count() > 0) {
    console.log('Testing Ticket Present Modal with QR...');
    await presentPassBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, '06_upgraded_pass_modal.png') });
  }

  await browser.close();
  console.log('Attendee verification finished!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
