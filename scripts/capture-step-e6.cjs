const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://127.0.0.1:5173';
const OUTPUT_DIR = path.resolve(__dirname, '../visual-snapshots-after');

async function run() {
  console.log('📸 Starting Step E.6 Attendee Dashboard & Lanyard Snapshot Capture...');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Launch Chromium with WebGL flags (SwiftShader) so 3D Lanyard renders headless (P-01)
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-gl=swiftshader',
      '--enable-unsafe-swiftshader',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  // 1. High-Definition Desktop Context
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await desktopContext.newPage();

  // Helper to switch to Attendee persona
  console.log('🔑 Activating attendee persona (Aditya Narayan)...');
  await page.goto(`${BASE_URL}/dev/accounts`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const attendeeBtn = page.getByRole('button', { name: /Aditya Narayan/i }).first();
  if (await attendeeBtn.isVisible()) {
    await attendeeBtn.click();
    await page.waitForTimeout(1000);
  }

  // Navigate to Attendee Dashboard
  console.log('🧭 Navigating to /attendee/dashboard...');
  await page.goto(`${BASE_URL}/attendee/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Check for canvas
  const canvasEl = page.locator('canvas').first();
  const hasCanvas = await canvasEl.isVisible();
  console.log(`🎨 3D Lanyard Canvas rendered: ${hasCanvas}`);

  // 1. Full Dashboard Page (Desktop 1440px)
  console.log('📷 Capturing desktop full-page snapshot...');
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'step-e6-dashboard-1440.png'),
    fullPage: true,
  });

  // 2. Switch to 2D ID Badge view and capture
  console.log('🔄 Toggling to 2D ID Badge mode...');
  const badge2dBtn = page.getByRole('button', { name: /2D/i }).first();
  if (await badge2dBtn.isVisible()) {
    await badge2dBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'step-e6-dashboard-2d-1440.png'),
      fullPage: true,
    });

    // Switch back to 3D for subsequent checks
    const badge3dBtn = page.getByRole('button', { name: /3D/i }).first();
    if (await badge3dBtn.isVisible()) {
      await badge3dBtn.click();
      await page.waitForTimeout(600);
    }
  }

  // 3. Click "Present Pass" on first boarding pass
  console.log('🎫 Clicking "Present Pass" on active ticket...');
  const presentBtn = page.getByRole('button', { name: /Present Pass/i }).first();
  if (await presentBtn.isVisible()) {
    await presentBtn.click();
    await page.waitForTimeout(1200);

    // Verify ticket has QR code and intact pass
    console.log('📷 Capturing floating ticket inspection...');
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'step-e6-ticket-modal-1440.png'),
      fullPage: false,
    });

    // Close modal via ESC key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  await desktopContext.close();

  // 4. Mobile Context (390x844 Retina)
  console.log('📱 Capturing mobile 390px snapshot...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  // Switch persona in mobile context
  await mobilePage.goto(`${BASE_URL}/dev/accounts`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(600);
  const mAttendeeBtn = mobilePage.getByRole('button', { name: /Aditya Narayan/i }).first();
  if (await mAttendeeBtn.isVisible()) {
    await mAttendeeBtn.click();
    await mobilePage.waitForTimeout(1000);
  }

  await mobilePage.goto(`${BASE_URL}/attendee/dashboard`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);

  await mobilePage.screenshot({
    path: path.join(OUTPUT_DIR, 'step-e6-dashboard-390.png'),
    fullPage: true,
  });

  await mobileContext.close();
  await browser.close();

  console.log('✅ Step E.6 Snapshots successfully generated in visual-snapshots-after/ !');
}

run().catch((err) => {
  console.error('❌ Error capturing Step E.6 snapshots:', err);
  process.exit(1);
});
