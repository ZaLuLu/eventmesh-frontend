const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://127.0.0.1:5173';
const FEATURES_DIR = path.resolve(__dirname, '../src/features');

async function run() {
  console.log('🚀 Starting EventMesh HD Feature Snapshot Generator...');

  const browser = await chromium.launch({ headless: true });

  // 1. High-Definition Desktop Context (Retina 2x Scale Factor for crisp HD pixels)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await desktopContext.newPage();

  // Helper to ensure target snapshot directory exists
  function getFeatureDir(feature) {
    const dir = path.join(FEATURES_DIR, feature, 'snapshots');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  // Helper to switch account persona
  async function switchPersona(roleRegex) {
    await page.goto(`${BASE_URL}/dev/accounts`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const btn = page.getByRole('button', { name: roleRegex }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(1500);
    } else {
      console.warn('⚠️ Could not find switch button for:', roleRegex);
    }
  }

  // =========================================================================
  // 1. EVENTS FEATURE
  // =========================================================================
  console.log('\n📸 [1/12] Capturing EVENTS feature snapshots...');
  const eventsDir = getFeatureDir('events');

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // 1.1 Home Full Page
  await page.screenshot({
    path: path.join(eventsDir, '01_home_page_fullpage_hd.png'),
    fullPage: true,
  });

  // 1.2 Hero & Navigation Above-the-fold
  await page.screenshot({
    path: path.join(eventsDir, '02_home_hero_and_navigation_hd.png'),
    clip: { x: 0, y: 0, width: 1440, height: 920 },
  });

  // 1.3 Campus Admission & Passes Matrix
  const admissionEl = page.locator('#admission');
  if (await admissionEl.isVisible()) {
    await admissionEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await admissionEl.screenshot({
      path: path.join(eventsDir, '03_campus_admission_passes_hd.png'),
    });
  }

  // 1.4 Tactile Ticket Preview (Intact)
  const previewPassBtn = page.getByRole('button', { name: /Preview Tactile Pass/i });
  if (await previewPassBtn.isVisible()) {
    await previewPassBtn.click();
    await page.waitForTimeout(800);

    const demoSection = page.locator('text=TACTILE DIGITAL PASS DEMONSTRATION').locator('xpath=ancestor::div[contains(@class, "bg-[#F8FAFC]")]').first();
    if (await demoSection.isVisible()) {
      await demoSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await demoSection.screenshot({
        path: path.join(eventsDir, '04_tactile_ticket_preview_intact_hd.png'),
      });

      // 1.5 Click Gate Stub -> Torn Ticket
      const gateStub = page.getByText('GATE STUB').first();
      if (await gateStub.isVisible()) {
        await gateStub.click();
        await page.waitForTimeout(1800); // Wait for tear animation and admitted sound/confetti
        await demoSection.screenshot({
          path: path.join(eventsDir, '05_tactile_ticket_preview_torn_hd.png'),
        });
      }
    }
  }

  // 1.6 Explore Page (Grid View)
  await page.goto(`${BASE_URL}/explore`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(eventsDir, '06_explore_page_grid_view_hd.png'),
    clip: { x: 0, y: 0, width: 1440, height: 960 },
  });

  // 1.7 Explore Page (List View)
  try {
    const listToggle = page.locator('button[aria-label*="list" i], [data-value="list"], button:has(svg.lucide-list)').first();
    if (await listToggle.isVisible()) {
      await listToggle.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(eventsDir, '07_explore_page_list_view_hd.png'),
        clip: { x: 0, y: 0, width: 1440, height: 960 },
      });
    }
  } catch (err) {
    console.log('List toggle skip:', err.message);
  }

  // 1.8 Event Detail (Grand Turing Hackathon 2026)
  await page.goto(`${BASE_URL}/events/grand-turing-hackathon-2026`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(eventsDir, '08_event_detail_overview_hd.png'),
    clip: { x: 0, y: 0, width: 1440, height: 960 },
  });

  // 1.9 Event Detail (Schedule & Logistics)
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(eventsDir, '09_event_detail_schedule_and_faq_hd.png'),
    clip: { x: 0, y: 0, width: 1440, height: 960 },
  });

  // =========================================================================
  // 2. REGISTRATION FEATURE
  // =========================================================================
  console.log('\n📸 [2/12] Capturing REGISTRATION feature snapshots...');
  const regDir = getFeatureDir('registration');

  await page.goto(`${BASE_URL}/events/grand-turing-hackathon-2026/register`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // 2.1 Registration Pass Selection & Form Full Page
  await page.screenshot({
    path: path.join(regDir, '01_registration_pass_selection_hd.png'),
    fullPage: true,
  });

  await page.screenshot({
    path: path.join(regDir, '02_registration_hero_above_fold_hd.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 },
  });

  // =========================================================================
  // 3. CLUBS FEATURE
  // =========================================================================
  console.log('\n📸 [3/12] Capturing CLUBS feature snapshots...');
  const clubsDir = getFeatureDir('clubs');

  // 3.1 Clubs Directory
  await page.goto(`${BASE_URL}/clubs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(clubsDir, '01_clubs_directory_fullpage_hd.png'),
    fullPage: true,
  });
  await page.screenshot({
    path: path.join(clubsDir, '02_clubs_directory_overview_hd.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 },
  });

  // 3.2 Club Detail Profile (DevCraft)
  await page.goto(`${BASE_URL}/clubs/devcraft`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(clubsDir, '03_club_detail_profile_hd.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 },
  });

  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(clubsDir, '04_club_detail_events_and_roster_hd.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 },
  });

  // =========================================================================
  // 4. CALENDAR FEATURE
  // =========================================================================
  console.log('\n📸 [4/12] Capturing CALENDAR feature snapshots...');
  const calDir = getFeatureDir('calendar');

  await page.goto(`${BASE_URL}/calendar`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(calDir, '01_calendar_month_view_hd.png'),
    fullPage: true,
  });

  // =========================================================================
  // 5. ANNOUNCEMENTS FEATURE
  // =========================================================================
  console.log('\n📸 [5/12] Capturing ANNOUNCEMENTS feature snapshots...');
  const annDir = getFeatureDir('announcements');

  await page.goto(`${BASE_URL}/announcements`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(annDir, '01_announcements_feed_hd.png'),
    fullPage: true,
  });

  // =========================================================================
  // 6. GALLERY FEATURE
  // =========================================================================
  console.log('\n📸 [6/12] Capturing GALLERY feature snapshots...');
  const galleryDir = getFeatureDir('gallery');

  await page.goto(`${BASE_URL}/gallery`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(galleryDir, '01_gallery_mosaic_fullpage_hd.png'),
    fullPage: true,
  });
  await page.screenshot({
    path: path.join(galleryDir, '02_gallery_mosaic_overview_hd.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 },
  });

  // =========================================================================
  // 7. ABOUT FEATURE
  // =========================================================================
  console.log('\n📸 [7/12] Capturing ABOUT feature snapshots...');
  const aboutDir = getFeatureDir('about');

  await page.goto(`${BASE_URL}/about`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(aboutDir, '01_about_page_fullpage_hd.png'),
    fullPage: true,
  });

  // =========================================================================
  // 8. CERTIFICATES FEATURE
  // =========================================================================
  console.log('\n📸 [8/12] Capturing CERTIFICATES feature snapshots...');
  const certDir = getFeatureDir('certificates');

  await page.goto(`${BASE_URL}/verify/TA-2026-001245`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(certDir, '01_verify_certificate_valid_hd.png'),
    fullPage: true,
  });

  // =========================================================================
  // 9. AUTH FEATURE
  // =========================================================================
  console.log('\n📸 [9/12] Capturing AUTH feature snapshots...');
  const authDir = getFeatureDir('auth');

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(authDir, '01_login_page_hd.png'),
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });

  await page.goto(`${BASE_URL}/dev/accounts`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(authDir, '02_dev_accounts_switcher_hd.png'),
    fullPage: true,
  });

  // =========================================================================
  // 10. DASHBOARD FEATURE (ATTENDEE CREDENTIALS & BOARDING PASSES)
  // =========================================================================
  console.log('\n📸 [10/12] Capturing DASHBOARD feature snapshots...');
  const dashDir = getFeatureDir('dashboard');

  // Authenticate as Attendee (Aditya Narayan)
  await switchPersona(/Aditya Narayan/i);
  await page.goto(`${BASE_URL}/attendee/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Three.js WebGL canvas initialization

  // 10.1 Full Dashboard Page
  await page.screenshot({
    path: path.join(dashDir, '01_attendee_dashboard_fullpage_hd.png'),
    fullPage: true,
  });

  // 10.2 Header & 3D Student ID Lanyard Credential
  await page.screenshot({
    path: path.join(dashDir, '02_attendee_dashboard_overview_hd.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 },
  });

  // 10.3 Focused 3D Lanyard Card
  const lanyardStage = page.locator('.lg\\:col-span-5').first();
  if (await lanyardStage.isVisible()) {
    await lanyardStage.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await lanyardStage.screenshot({
      path: path.join(dashDir, '03_student_id_3d_lanyard_credential_hd.png'),
    });
  }

  // 10.4 Double-Sided Boarding Passes Grid
  const passesSection = page.locator('div:has-text("My tickets")').locator('xpath=ancestor::div[contains(@class, "app-container")]').last();
  if (await passesSection.isVisible()) {
    await passesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await passesSection.screenshot({
      path: path.join(dashDir, '04_my_tickets_boarding_passes_hd.png'),
    });
  }

  // 10.5 Floating Modal Pass Inspection
  const presentBtn = page.getByRole('button', { name: /Present Pass/i }).first();
  if (await presentBtn.isVisible()) {
    await presentBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(dashDir, '05_floating_ticket_modal_intact_hd.png'),
    });

    // 10.6 Tear the ticket in floating modal
    const modalStub = page.locator('text=GATE STUB').first();
    if (await modalStub.isVisible()) {
      await modalStub.click();
      await page.waitForTimeout(1800);
      await page.screenshot({
        path: path.join(dashDir, '06_floating_ticket_modal_torn_hd.png'),
      });
    }

    // Close modal by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // 10.7 Certificates Tab
  const certTab = page.getByRole('button', { name: /Certificates/i }).first();
  if (await certTab.isVisible()) {
    await certTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(dashDir, '07_dashboard_certificates_tab_hd.png'),
      clip: { x: 0, y: 0, width: 1440, height: 950 },
    });
  }

  // 10.8 Followed Clubs Tab
  const clubsTab = page.getByRole('button', { name: /Followed clubs/i }).first();
  if (await clubsTab.isVisible()) {
    await clubsTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(dashDir, '08_dashboard_followed_clubs_tab_hd.png'),
      clip: { x: 0, y: 0, width: 1440, height: 950 },
    });
  }

  // =========================================================================
  // 11. ADMIN FEATURE CONSOLE
  // =========================================================================
  console.log('\n📸 [11/12] Capturing ADMIN console snapshots (Sovereign Administrator)...');
  const adminDir = getFeatureDir('admin');

  // Authenticate as Platform Admin (Sovereign Administrator)
  await switchPersona(/Sovereign Administrator/i);
  await page.waitForTimeout(1500);

  // 11.1 Admin Dashboard
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(adminDir, '01_admin_dashboard_metrics_hd.png'),
    fullPage: true,
  });

  // 11.2 Admin Events List Table
  await page.goto(`${BASE_URL}/admin/events`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(adminDir, '02_admin_events_table_hd.png'),
    fullPage: true,
  });

  // 11.3 Admin Event Creator Wizard
  await page.goto(`${BASE_URL}/admin/events/new`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(adminDir, '03_admin_event_wizard_step1_hd.png'),
    fullPage: true,
  });

  // 11.4 Admin Checkin Gate Terminal
  await page.goto(`${BASE_URL}/admin/checkin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(adminDir, '04_admin_checkin_terminal_hd.png'),
    fullPage: true,
  });

  // 11.5 Admin Registrations Table
  await page.goto(`${BASE_URL}/admin/registrations`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(adminDir, '05_admin_registrations_table_hd.png'),
    fullPage: true,
  });

  // 11.6 Admin Certificates Manager
  await page.goto(`${BASE_URL}/admin/certificates`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(adminDir, '06_admin_certificates_manager_hd.png'),
    fullPage: true,
  });

  // 11.7 Admin Announcements Broadcast
  await page.goto(`${BASE_URL}/admin/announcements`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(adminDir, '07_admin_announcements_composer_hd.png'),
    fullPage: true,
  });

  // 11.8 Admin Club Profile
  await page.goto(`${BASE_URL}/admin/club`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(adminDir, '08_admin_club_profile_settings_hd.png'),
    fullPage: true,
  });

  // 11.9 Admin Clubs List (Org/Platform Admin)
  await page.goto(`${BASE_URL}/admin/clubs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(adminDir, '09_admin_clubs_registry_hd.png'),
    fullPage: true,
  });

  // 11.10 Admin Roles & RBAC
  await page.goto(`${BASE_URL}/admin/roles`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(adminDir, '10_admin_roles_and_permissions_hd.png'),
    fullPage: true,
  });

  // 11.11 Admin Approvals Queue
  await page.goto(`${BASE_URL}/admin/approvals`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(adminDir, '11_admin_approvals_queue_hd.png'),
    fullPage: true,
  });

  // 11.12 Admin Analytics
  await page.goto(`${BASE_URL}/admin/analytics`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(adminDir, '12_admin_analytics_reports_hd.png'),
    fullPage: true,
  });

  // 11.13 Admin Audit Log
  await page.goto(`${BASE_URL}/admin/audit`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(adminDir, '13_admin_audit_logs_hd.png'),
    fullPage: true,
  });

  // 11.14 Admin Settings
  await page.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(adminDir, '14_admin_settings_hd.png'),
    fullPage: true,
  });

  // =========================================================================
  // 12. STYLEGUIDE & DESIGN SYSTEM
  // =========================================================================
  console.log('\n📸 [12/12] Capturing STYLEGUIDE feature snapshots...');
  const styleDir = getFeatureDir('styleguide');

  await page.goto(`${BASE_URL}/styleguide`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // 12.1 Full Styleguide
  await page.screenshot({
    path: path.join(styleDir, '01_styleguide_fullpage_hd.png'),
    fullPage: true,
  });

  // 12.2 Styleguide Above Fold
  await page.screenshot({
    path: path.join(styleDir, '02_styleguide_typography_and_colors_hd.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 },
  });

  // 12.3 Components Section
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(styleDir, '03_styleguide_primitives_and_badges_hd.png'),
    clip: { x: 0, y: 0, width: 1440, height: 950 },
  });

  await desktopContext.close();

  // =========================================================================
  // 13. MOBILE RESPONSIVE SNAPSHOTS
  // =========================================================================
  console.log('\n📱 Capturing Detailed Mobile HD Snapshots (iPhone 14 / 390x844 Retina)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  // Mobile Home
  await mobilePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(eventsDir, '11_home_mobile_viewport_hd.png'),
    fullPage: false,
  });

  // Mobile Explore
  await mobilePage.goto(`${BASE_URL}/explore`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({
    path: path.join(eventsDir, '12_explore_mobile_viewport_hd.png'),
    fullPage: false,
  });

  // Mobile Clubs
  await mobilePage.goto(`${BASE_URL}/clubs`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({
    path: path.join(clubsDir, '05_clubs_directory_mobile_hd.png'),
    fullPage: false,
  });

  // Mobile Calendar
  await mobilePage.goto(`${BASE_URL}/calendar`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({
    path: path.join(calDir, '02_calendar_mobile_hd.png'),
    fullPage: false,
  });

  // Mobile Dashboard
  await mobilePage.goto(`${BASE_URL}/dev/accounts`, { waitUntil: 'networkidle' });
  const switchMBtn = mobilePage.getByRole('button', { name: /Aditya Narayan/i }).first();
  if (await switchMBtn.isVisible()) {
    await switchMBtn.click();
    await mobilePage.waitForTimeout(1200);
  }
  await mobilePage.goto(`${BASE_URL}/attendee/dashboard`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1500);
  await mobilePage.screenshot({
    path: path.join(dashDir, '09_dashboard_mobile_hd.png'),
    fullPage: false,
  });

  // Mobile Admin Console
  await mobilePage.goto(`${BASE_URL}/dev/accounts`, { waitUntil: 'networkidle' });
  const switchABtn = mobilePage.getByRole('button', { name: /Sovereign Administrator/i }).first();
  if (await switchABtn.isVisible()) {
    await switchABtn.click();
    await mobilePage.waitForTimeout(1200);
  }
  await mobilePage.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1200);
  await mobilePage.screenshot({
    path: path.join(adminDir, '15_admin_dashboard_mobile_hd.png'),
    fullPage: false,
  });

  await mobileContext.close();
  await browser.close();

  console.log('\n✨ All HD feature snapshots successfully captured across all 12 feature folders!');
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
