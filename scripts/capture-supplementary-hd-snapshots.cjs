const { chromium } = require('@playwright/test');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:5173';
const FEATURES_DIR = path.resolve(__dirname, '../src/features');

async function run() {
  console.log('📸 Capturing supplementary detailed HD feature snapshots...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. Dashboard: Certificates Tab & Followed Clubs Tab
  console.log('Capturing Dashboard Tabs...');
  await page.goto(`${BASE_URL}/dev/accounts`, { waitUntil: 'networkidle' });
  const switchBtn = page.getByRole('button', { name: /Aditya Narayan/i }).first();
  await switchBtn.click();
  await page.waitForTimeout(1000);
  await page.goto(`${BASE_URL}/attendee/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const certTab = page.getByRole('tab', { name: /Certificates/i }).first();
  if (await certTab.isVisible()) {
    await certTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(FEATURES_DIR, 'dashboard/snapshots/07_dashboard_certificates_tab_hd.png'),
      clip: { x: 0, y: 0, width: 1440, height: 950 },
    });
  }

  const clubsTab = page.getByRole('tab', { name: /Followed clubs/i }).first();
  if (await clubsTab.isVisible()) {
    await clubsTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(FEATURES_DIR, 'dashboard/snapshots/08_dashboard_followed_clubs_tab_hd.png'),
      clip: { x: 0, y: 0, width: 1440, height: 950 },
    });
  }

  // 2. Registration: Pass selection & details modal
  console.log('Capturing Registration detail states...');
  await page.goto(`${BASE_URL}/events/grand-turing-hackathon-2026/register`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const tierCard = page.locator('text=VIP Hacker').first();
  if (await tierCard.isVisible()) {
    await tierCard.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(FEATURES_DIR, 'registration/snapshots/03_registration_tier_selected_hd.png'),
      clip: { x: 0, y: 0, width: 1440, height: 950 },
    });
  }

  // 3. Calendar: Day Click & Event Popup / Inspection
  console.log('Capturing Calendar detail state...');
  await page.goto(`${BASE_URL}/calendar`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const dayCell = page.locator('text=24').first();
  if (await dayCell.isVisible()) {
    await dayCell.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(FEATURES_DIR, 'calendar/snapshots/03_calendar_day_selection_hd.png'),
      clip: { x: 0, y: 0, width: 1440, height: 950 },
    });
  }

  // 4. Certificates: Verify Lookup page (/verify without ID or with ID)
  console.log('Capturing Certificates detail state...');
  await page.goto(`${BASE_URL}/verify/TA-2026-001245`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(FEATURES_DIR, 'certificates/snapshots/02_verify_certificate_card_hd.png'),
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });

  await context.close();
  await browser.close();
  console.log('✨ Supplementary HD snapshots successfully captured!');
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
