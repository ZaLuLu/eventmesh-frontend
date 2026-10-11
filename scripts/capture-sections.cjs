const { chromium } = require('@playwright/test');
const path = require('path');

const ARTIFACT_DIR = '/home/wafiq/.gemini/antigravity-ide/brain/c3d87ab1-c779-4750-8ec5-38b43b5abfeb/screenshots';
const BASE_URL = 'http://localhost:5173';

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop context
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await desktopContext.newPage();

  console.log('Capturing Desktop 01: Hero & Navigation...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '01_hero_and_navigation.png'),
    clip: { x: 0, y: 0, width: 1440, height: 920 }
  });

  console.log('Capturing Desktop 02: Home Feed & Featured Grid...');
  await page.evaluate(() => window.scrollTo(0, 850));
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '02_home_featured_and_grid.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 }
  });

  console.log('Capturing Desktop 03: Explore Toolbar & Grid View...');
  await page.goto(`${BASE_URL}/explore`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '03_explore_toolbar_and_grid.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 }
  });

  console.log('Capturing Desktop 04: Explore List View...');
  // Click list view toggle if available
  try {
    const listBtn = page.locator('button[aria-label*="list" i], button:has(svg.lucide-list), [data-value="list"]').first();
    if (await listBtn.isVisible()) {
      await listBtn.click();
      await page.waitForTimeout(500);
    }
  } catch (e) {
    console.log('List toggle click skipped:', e.message);
  }
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '04_explore_list_view.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 }
  });

  console.log('Capturing Desktop 05: Event Detail Page (Hero & Meta)...');
  await page.goto(`${BASE_URL}/events/grand-turing-hackathon-2026`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '05_event_detail_overview.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 }
  });

  console.log('Capturing Desktop 06: Event Detail (Agenda & Tickets)...');
  await page.evaluate(() => window.scrollTo(0, 750));
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '06_event_detail_schedule_and_tickets.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 }
  });

  console.log('Capturing Desktop 07: Clubs Directory...');
  await page.goto(`${BASE_URL}/clubs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '07_clubs_directory.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 }
  });

  console.log('Capturing Desktop 08: Club Profile...');
  await page.goto(`${BASE_URL}/clubs/devcraft`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '08_club_detail_profile.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 }
  });

  console.log('Capturing Desktop 09: Calendar Page...');
  await page.goto(`${BASE_URL}/calendar`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '09_calendar_view.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 }
  });

  console.log('Capturing Desktop 10: Gallery Page...');
  await page.goto(`${BASE_URL}/gallery`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '10_gallery_view.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 }
  });

  console.log('Capturing Desktop 11: Styleguide & Primitives...');
  await page.goto(`${BASE_URL}/styleguide`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '11_styleguide_primitives.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 }
  });

  console.log('Authenticating as Attendee for Dashboard...');
  await page.goto(`${BASE_URL}/dev/accounts`, { waitUntil: 'networkidle' });
  const attendeeBtn = page.getByRole('button', { name: /Switch to Alex Rivera|Switch to Priya Sharma/i }).first();
  if (await attendeeBtn.isVisible()) {
    await attendeeBtn.click();
    await page.waitForTimeout(800);
  }
  await page.goto(`${BASE_URL}/attendee/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '12_attendee_dashboard.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 }
  });

  console.log('Authenticating as Platform Admin for Admin Console...');
  await page.goto(`${BASE_URL}/dev/accounts`, { waitUntil: 'networkidle' });
  const adminBtn = page.getByRole('button', { name: /Switch to Dr. Robert Vance|Switch to DevCraft Lead/i }).first();
  if (await adminBtn.isVisible()) {
    await adminBtn.click();
    await page.waitForTimeout(800);
  }
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '13_admin_dashboard.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 }
  });

  await page.goto(`${BASE_URL}/admin/events`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '14_admin_events_table.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 }
  });

  await desktopContext.close();

  // 2. Mobile context
  console.log('Capturing Mobile Viewports...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(ARTIFACT_DIR, '15_mobile_home.png'),
    fullPage: false,
  });

  await mobilePage.goto(`${BASE_URL}/explore`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(ARTIFACT_DIR, '16_mobile_explore.png'),
    fullPage: false,
  });

  await mobileContext.close();
  await browser.close();
  console.log('All screenshots successfully generated in:', ARTIFACT_DIR);
}

run().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
