const fs = require('fs');
const path = require('path');

const FEATURES_DIR = path.resolve(__dirname, '../src/features');

const FEATURE_METADATA = {
  events: {
    title: 'Events & Discovery Feature Snapshots',
    description: 'High-definition captures of the campus events catalog, hero promotion carousel, 3-tier admission pass matrix, and tactile digital ticket passes.',
    routes: ['/', '/explore', '/events/:slug'],
    snapshots: [
      { file: '01_home_page_fullpage_hd.png', desc: 'Full-page scroll of Home: Hero, announcements ticker, promo carousel, category rails, admission matrix, colophon footer', resolution: '2880 x ~4200 (HD 2x)' },
      { file: '02_home_hero_and_navigation_hd.png', desc: 'Above-the-fold Hero section with global navigation, search bar, active campus switcher, and headline display', resolution: '2880 x 1840 (HD 2x)' },
      { file: '03_campus_admission_passes_hd.png', desc: '3-Tier Campus Accreditation & Admission Matrix (#admission): General Pass, Builder Pass (Electric Cobalt flagship), VIP Patron', resolution: '2880 x 1500 (HD 2x)' },
      { file: '04_tactile_ticket_preview_intact_hd.png', desc: 'Interactive tactile pass demonstration: white physical cardstock with QR code, OTP code slots, and intact gate stub #01', resolution: '2880 x 1100 (HD 2x)' },
      { file: '05_tactile_ticket_preview_torn_hd.png', desc: 'Torn gate stub state: severed perforation serrations, gate chime animation, celebration confetti, and admitted badge', resolution: '2880 x 1100 (HD 2x)' },
      { file: '06_explore_page_grid_view_hd.png', desc: 'Explore catalog in 3-column Grid View with category chips, search bar, date filters, and event cards', resolution: '2880 x 1920 (HD 2x)' },
      { file: '07_explore_page_list_view_hd.png', desc: 'Explore catalog toggled to List Row View for fast scanning of dates, venues, organizers, and seat capacity', resolution: '2880 x 1920 (HD 2x)' },
      { file: '08_event_detail_overview_hd.png', desc: 'Flagship Event Detail (Grand Turing Hackathon 2026): Cover banner, countdown, tags, quick logistics, and registration CTA', resolution: '2880 x 1920 (HD 2x)' },
      { file: '09_event_detail_schedule_and_faq_hd.png', desc: 'Event Detail content: Multi-day schedule timeline, keynote speakers, venue floor map, and interactive FAQ accordions', resolution: '2880 x 1920 (HD 2x)' },
      { file: '11_home_mobile_viewport_hd.png', desc: 'Mobile viewport (iPhone 14 / 390px) responsive view of Home page and Hero carousel', resolution: '780 x 1688 (Mobile 2x)' },
      { file: '12_explore_mobile_viewport_hd.png', desc: 'Mobile viewport responsive view of Explore event catalog and filter bar', resolution: '780 x 1688 (Mobile 2x)' }
    ]
  },
  registration: {
    title: 'Registration & Checkout Feature Snapshots',
    description: 'High-definition captures of the multi-tier registration flow, ticket selection cards, and form renderer.',
    routes: ['/events/:slug/register'],
    snapshots: [
      { file: '01_registration_pass_selection_hd.png', desc: 'Full-page event registration: Admission tier selection, pricing breakdown, custom form fields, and checkout summary', resolution: '2880 x ~3200 (HD 2x)' },
      { file: '02_registration_hero_above_fold_hd.png', desc: 'Registration page above-the-fold hero and event accreditation details', resolution: '2880 x 1900 (HD 2x)' },
      { file: '03_registration_tier_selected_hd.png', desc: 'Interactive pass selection state with selected tier highlight and real-time fee calculation', resolution: '2880 x 1900 (HD 2x)' }
    ]
  },
  clubs: {
    title: 'Clubs & Organizations Feature Snapshots',
    description: 'High-definition captures of the campus clubs directory, categorization chips, and detailed club profile pages.',
    routes: ['/clubs', '/clubs/:slug'],
    snapshots: [
      { file: '01_clubs_directory_fullpage_hd.png', desc: 'Full-page clubs directory showing all 9 autonomous collectives with member counts, categories, and social links', resolution: '2880 x ~3400 (HD 2x)' },
      { file: '02_clubs_directory_overview_hd.png', desc: 'Clubs directory header, search filters, and top collectives grid', resolution: '2880 x 1900 (HD 2x)' },
      { file: '03_club_detail_profile_hd.png', desc: 'Club Detail (DevCraft): Cover artwork, lead badge, BellToggle follow notifications, member count, and overview', resolution: '2880 x 1900 (HD 2x)' },
      { file: '04_club_detail_events_and_roster_hd.png', desc: 'Club Detail lower section: Upcoming events list, core executive team roster, and past activities gallery', resolution: '2880 x 1900 (HD 2x)' },
      { file: '05_clubs_directory_mobile_hd.png', desc: 'Mobile viewport responsive layout of Clubs directory', resolution: '780 x 1688 (Mobile 2x)' }
    ]
  },
  calendar: {
    title: 'Calendar Feature Snapshots',
    description: 'High-definition captures of the campus event calendar with month grid, date markers, and scheduled event inspection.',
    routes: ['/calendar'],
    snapshots: [
      { file: '01_calendar_month_view_hd.png', desc: 'Full-page interactive calendar month grid with colored event markers, weekend highlights, and event count pills', resolution: '2880 x ~2200 (HD 2x)' },
      { file: '02_calendar_mobile_hd.png', desc: 'Mobile responsive view of Calendar with compact month scrubber and agenda listing', resolution: '780 x 1688 (Mobile 2x)' },
      { file: '03_calendar_day_selection_hd.png', desc: 'Interactive day selection state with highlighted date cell and day agenda popup', resolution: '2880 x 1900 (HD 2x)' }
    ]
  },
  announcements: {
    title: 'Announcements Feature Snapshots',
    description: 'High-definition captures of campus broadcasts, critical notifications, and priority alert filters.',
    routes: ['/announcements'],
    snapshots: [
      { file: '01_announcements_feed_hd.png', desc: 'Full-page campus announcements feed with priority badges, timestamp indicators, and broadcast author tags', resolution: '2880 x ~2400 (HD 2x)' }
    ]
  },
  gallery: {
    title: 'Gallery Feature Snapshots',
    description: 'High-definition captures of the campus photography archive, photo mosaic, and lightbox recaps.',
    routes: ['/gallery'],
    snapshots: [
      { file: '01_gallery_mosaic_fullpage_hd.png', desc: 'Full-page media mosaic with high-resolution hackathon and symposium photography, event labels, and photographer credits', resolution: '2880 x ~3200 (HD 2x)' },
      { file: '02_gallery_mosaic_overview_hd.png', desc: 'Above-the-fold gallery view with category filter tags and image grid', resolution: '2880 x 1900 (HD 2x)' }
    ]
  },
  about: {
    title: 'About & Platform Philosophy Feature Snapshots',
    description: 'High-definition captures of the association mission, platform architecture, coordinators, and engineering philosophy.',
    routes: ['/about'],
    snapshots: [
      { file: '01_about_page_fullpage_hd.png', desc: 'Full-page About view: Federation history, leadership coordinators, open-source principles, and technical roadmap', resolution: '2880 x ~3600 (HD 2x)' }
    ]
  },
  certificates: {
    title: 'Certificates Verification Feature Snapshots',
    description: 'High-definition captures of cryptographic certificate verification, credential seals, and public verification records.',
    routes: ['/verify/:certificateId'],
    snapshots: [
      { file: '01_verify_certificate_valid_hd.png', desc: 'Full-page verified certificate record: Certificate ID (TA-2026-001245), recipient name, issuing collective, verification seal, and QR code', resolution: '2880 x ~2200 (HD 2x)' },
      { file: '02_verify_certificate_card_hd.png', desc: 'Focused inspection of the verifiable credential card with SHA-256 hash and issuer validation status', resolution: '2880 x 1800 (HD 2x)' }
    ]
  },
  auth: {
    title: 'Authentication & Dev Accounts Feature Snapshots',
    description: 'High-definition captures of student login portal and role-based persona switcher.',
    routes: ['/login', '/dev/accounts'],
    snapshots: [
      { file: '01_login_page_hd.png', desc: 'Sign-in portal with university single sign-on option, credential fields, and branding', resolution: '2880 x 1800 (HD 2x)' },
      { file: '02_dev_accounts_switcher_hd.png', desc: 'Dev Accounts switcher: One-click personas for Sovereign Administrator, Org Admin, Club Admins, Volunteers, and Students', resolution: '2880 x ~3200 (HD 2x)' }
    ]
  },
  dashboard: {
    title: 'Attendee Dashboard & Credential Vault Feature Snapshots',
    description: 'High-definition captures of the attendee profile, 3D physics-based student ID lanyard, double-sided boarding passes, and live ticket check-in simulation.',
    routes: ['/attendee/dashboard', '/me'],
    snapshots: [
      { file: '01_attendee_dashboard_fullpage_hd.png', desc: 'Full-page Attendee Dashboard: Student metadata, summary counters, 3D physics Lanyard ID, and My Tickets grid', resolution: '2880 x ~3600 (HD 2x)' },
      { file: '02_attendee_dashboard_overview_hd.png', desc: 'Dashboard Hero with student registration bento (Reg No, Degree, Semester) and active metrics', resolution: '2880 x 1900 (HD 2x)' },
      { file: '03_student_id_3d_lanyard_credential_hd.png', desc: 'Dedicated focus on the interactive Three.js 3D Student ID Badge swinging on realistic fabric woven lanyard with holographic chip and barcode', resolution: '1720 x 1560 (HD 2x)' },
      { file: '04_my_tickets_boarding_passes_hd.png', desc: 'Double-sided tactile boarding pass cards with departure dates, venues, gate codes, and "Present Pass" actions', resolution: '2880 x 1200 (HD 2x)' },
      { file: '05_floating_ticket_modal_intact_hd.png', desc: 'Floating modal ticket pass inspection: White heavy cardstock, scannable QR code, gate check-in stub #01, rolling OTP slots', resolution: '2880 x 1800 (HD 2x)' },
      { file: '06_floating_ticket_modal_torn_hd.png', desc: 'Torn stub state in modal: Severed mechanical perforation, admitted stamp, and confetti feedback', resolution: '2880 x 1800 (HD 2x)' },
      { file: '07_dashboard_certificates_tab_hd.png', desc: 'Certificates tab: Verified completion credentials with direct PDF download and verification links', resolution: '2880 x 1900 (HD 2x)' },
      { file: '08_dashboard_followed_clubs_tab_hd.png', desc: 'Followed Clubs tab: Subscribed campus collectives with notification statuses', resolution: '2880 x 1900 (HD 2x)' },
      { file: '09_dashboard_mobile_hd.png', desc: 'Mobile viewport responsive view of Attendee Dashboard and boarding passes', resolution: '780 x 1688 (Mobile 2x)' }
    ]
  },
  admin: {
    title: 'Admin Console & Governance Feature Snapshots',
    description: 'High-definition captures of the administrative command center, check-in gate terminal, event wizard, and RBAC governance.',
    routes: ['/admin', '/admin/events', '/admin/events/new', '/admin/checkin', '/admin/registrations', '/admin/certificates', '/admin/announcements', '/admin/club', '/admin/clubs', '/admin/roles', '/admin/approvals', '/admin/analytics', '/admin/audit', '/admin/settings'],
    snapshots: [
      { file: '01_admin_dashboard_metrics_hd.png', desc: 'Admin Dashboard: Live registration velocity, revenue metrics, attendance gauges, and pending actions queue', resolution: '2880 x ~3200 (HD 2x)' },
      { file: '02_admin_events_table_hd.png', desc: 'Full-page Events Directory data table: Published/Draft filters, capacity quotas, status badges, and action menus', resolution: '2880 x ~5800 (HD 2x)' },
      { file: '03_admin_event_wizard_step1_hd.png', desc: 'Event Creation Wizard: Multi-step stepper, basic info, dates, venue allocation, and category picker', resolution: '2880 x ~2800 (HD 2x)' },
      { file: '04_admin_checkin_terminal_hd.png', desc: 'Turnstile Gate Terminal: Real-time QR camera scanner, manual attendee lookup, rapid pass validation, and check-in stats', resolution: '2880 x ~2400 (HD 2x)' },
      { file: '05_admin_registrations_table_hd.png', desc: 'Attendee Registry: Filterable table of all registrations with status filters and CSV export', resolution: '2880 x ~2800 (HD 2x)' },
      { file: '06_admin_certificates_manager_hd.png', desc: 'Certificates Manager: Batch issuance tool and verifiable credential registry', resolution: '2880 x ~2400 (HD 2x)' },
      { file: '07_admin_announcements_composer_hd.png', desc: 'Announcements Broadcast: Priority broadcast composer and published alerts history', resolution: '2880 x ~2800 (HD 2x)' },
      { file: '08_admin_club_profile_settings_hd.png', desc: 'Club Profile Editor: Branding customizer, logo, cover image, and description', resolution: '2880 x ~3000 (HD 2x)' },
      { file: '09_admin_clubs_registry_hd.png', desc: 'Clubs Overview (Org/Platform Admin): Complete registry of campus collectives', resolution: '2880 x ~3200 (HD 2x)' },
      { file: '10_admin_roles_and_permissions_hd.png', desc: 'Roles & Staff RBAC: Role-based permissions matrix for organizers, admins, and volunteers', resolution: '2880 x ~2800 (HD 2x)' },
      { file: '11_admin_approvals_queue_hd.png', desc: 'Approvals Queue: Workflow queue for pending event submissions and budgetary sign-offs', resolution: '2880 x ~2200 (HD 2x)' },
      { file: '12_admin_analytics_reports_hd.png', desc: 'Analytics & Reporting: Attendance conversion charts, peak hour graphs, and demographic distributions', resolution: '2880 x ~2800 (HD 2x)' },
      { file: '13_admin_audit_logs_hd.png', desc: 'Audit Trail: Security log of all administrative actions and gate entries', resolution: '2880 x ~2600 (HD 2x)' },
      { file: '14_admin_settings_hd.png', desc: 'Platform Settings: General configuration, notification gateways, and theme defaults', resolution: '2880 x ~2600 (HD 2x)' },
      { file: '15_admin_dashboard_mobile_hd.png', desc: 'Mobile responsive view of Admin Console on smartphone viewport', resolution: '780 x 1688 (Mobile 2x)' }
    ]
  },
  styleguide: {
    title: 'Design System & Styleguide Feature Snapshots',
    description: 'High-definition captures of the Swiss Modernist design system tokens, typography scales, buttons, badges, and micro-interactions.',
    routes: ['/styleguide'],
    snapshots: [
      { file: '01_styleguide_fullpage_hd.png', desc: 'Full-page design system reference: Colors, typography scale, buttons, inputs, badges, sheets, and micro-components', resolution: '2880 x ~5200 (HD 2x)' },
      { file: '02_styleguide_typography_and_colors_hd.png', desc: 'Design tokens: Electric Cobalt (#0047FF), Paper White (#FFFFFF), Plus Jakarta Sans Display, and JetBrains Mono', resolution: '2880 x 1900 (HD 2x)' },
      { file: '03_styleguide_primitives_and_badges_hd.png', desc: 'Interactive primitives: Buttons, status badges, toggle groups, and select dropdowns', resolution: '2880 x 1900 (HD 2x)' }
    ]
  }
};

for (const [featureKey, meta] of Object.entries(FEATURE_METADATA)) {
  const dir = path.join(FEATURES_DIR, featureKey, 'snapshots');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tableRows = meta.snapshots.map(s => {
    return `| \`${s.file}\` | ${s.desc} | **${s.resolution}** |`;
  }).join('\n');

  const content = `# ${meta.title}

> **Feature Location**: [\`src/features/${featureKey}\`](file:///home/wafiq/coding/eventmesh-frontend/src/features/${featureKey})  
> **Associated Routes**: ${meta.routes.map(r => `\`${r}\``).join(', ')}  
> **Capture Standard**: **High Definition (Retina 2x Scale Factor)**  
> **Design Theme**: **Electric Cobalt Blue (\`#0047FF\`) & Paper White (\`#FFFFFF\`) Swiss Modernist System**

---

## Overview
${meta.description}

---

## HD Snapshot Catalog

| Snapshot File | Description & State Captured | Resolution |
|---|---|---|
${tableRows}

---

## Technical & Design Specifications Verified

1. **Retina HD Rendering**: All snapshots were generated with a \`deviceScaleFactor: 2\` ensuring pixel-perfect sharpness on Retina/HiDPI displays.
2. **Typography Integrity**: Display typography uses **Plus Jakarta Sans Variable** with tight negative letter tracking (\`tracking-[-0.03em]\`) and technical numerals rendered in **JetBrains Mono**.
3. **Drafting Canvas Baseline**: Technical hairline borders (\`border-line\`), corner markers (\`+\`), and isometric drafting grids are preserved across full-bleed viewports.
4. **State Machine Coverage**: Captures both static default states and interactive runtime states (including active pass selection, gate stub mechanical tear, and modal presentation).
`;

  fs.writeFileSync(path.join(dir, 'README.md'), content);
  console.log(`✅ Generated README.md in src/features/${featureKey}/snapshots/`);
}

console.log('\n🎉 All feature snapshot README documentations successfully generated!');
