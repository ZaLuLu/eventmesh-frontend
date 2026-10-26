# EventMesh Frontend Architectural Specification (V2 Redesign)

**Status:** Complete & Verified  
**Date:** October 2026  
**Architect:** Lead Product Designer & Principal Frontend Architect  

---

## 1. Executive Summary & Design System Transformation

The EventMesh frontend has undergone an end-to-end audit, deduplication, and architectural redesign. All outdated documentation, fragmented test profiles, and inconsistent navigation flows have been systematically purged. The visual identity has been refactored into a **tactile, editorial, Swiss-modern architectural aesthetic** that strictly preserves the original brand palette while eliminating neon glows, arcade flourishes, and visual clutter.

---

## 2. Brand Tokens & Color System

All brand colors remain identical to the core foundation tokens, mapped to precise structural roles:

| Token / Role | Hex / HSL Value | Surface Role |
| :--- | :--- | :--- |
| **Primary Accent (`--accent`)** | `#6366f1` / `hsl(238 84% 67%)` | High-priority interactive triggers, active tab indicators, ID card hologram edge |
| **Accent Soft (`--accent-soft`)** | `rgba(99, 102, 241, 0.08)` | Chip backgrounds, subtle hover highlights, badge fills |
| **Canvas / Background (`--bg`)** | `#ffffff` (Light) / `#09090b` (Dark) | Foundation canvas; 100% solid, zero neon glow |
| **Elevated Surface (`--surface`)** | `#f8fafc` (Light) / `#121217` (Dark) | Cards, modals, slide surfaces, ID pass backplate |
| **Subtle Surface (`--surface-subtle`)** | `#f1f5f9` (Light) / `#18181f` (Dark) | Profile squircle container, secondary button fills |
| **Structural Border (`--line`)** | `#e2e8f0` (Light) / `#27272a` (Dark) | Crisp 1px hairline dividers; high-contrast architectural framing |
| **Primary Ink (`--ink`)** | `#09090b` (Light) / `#fafafa` (Dark) | Headers, active titles, high-contrast labels (WCAG AAA) |
| **Muted Ink (`--ink-muted`)** | `#64748b` (Light) / `#a1a1aa` (Dark) | Metadata kickers, semester details, roll numbers |

---

## 3. Single Curated Test Profile & Academic Entity

All fragmented, hardcoded dummy accounts (`usr-plat`, `usr-org`, `usr-cluba`, etc.) have been completely removed. The application is seeded with **strictly one curated institutional test profile** that possesses dual administrative and attendee capabilities:

### Test User Profile
- **Name:** `Suraj Naik`
- **Email:** `ceosuraj@email.com`
- **Role:** `org_admin` (Full access to Organizer Studio & Attendee Dashboard)
- **Roll Number / Student ID:** `CTU-2026-0814`
- **Degree & Branch:** `B.Tech Computer Science & Engineering`
- **Semester:** `Semester 6 (Senior Division)`
- **Blood Group:** `O+`
- **Institution:** `Central Technological University (CTU Main Campus)`
- **Header Avatar / Squircle:** Dynamic initials badge `SN` or custom profile photo with 12px squircle radius.

### Institutional Entity & Verified Campus Clubs
- **University:** `Central Technological University (CTU)`
  - **Tagline:** Autonomous Premier Engineering & Research Institution
  - **Slug / ID:** `ctu-main`
- **Strictly 3 Curated Student Guilds:**
  1. **CTU ACM Chapter (`club-acm`)**: Advancing algorithmic systems, distributed computing, and competitive development.
  2. **Apex Robotics & Autonomous Systems Guild (`club-robotics`)**: Autonomous hardware, ROS2 engineering, UAV navigation, and robotics symposiums.
  3. **The Design & Creative Media Society (`club-design`)**: Architectural UI/UX, editorial publications, typography, and motion design.

---

## 4. Route Architecture & Deduplication Audit

All duplicate, overlapping, and dead routes have been resolved into distinct, high-conviction interaction paths:

| Route Path | View / Component | Resolved Behavior & Intent |
| :--- | :--- | :--- |
| `/` | `HomePage` | Re-architected flow: **Cinematic Hero Carousel** -> **Curated Premieres** -> **Active Themes**. Overlays stripped of clutter. |
| `/explore` | `ExplorePage` | Filterable catalog by category, date, and fee. Fixed duplicate "Explore" vs "Schedule" button conflict. |
| `/calendar` | `CalendarPage` | Dedicated month/week interactive campus calendar grid. Synchronized with live event dates. |
| `/my-college` | `MyCollegePage` | **NEW:** Unified campus hub replacing redundant clubs directory. Features CTU institutional accreditation, Suraj Naik's verified student badge (`CTU-2026-0814`), the 3 curated clubs, and the weekly campus timetable. |
| `/clubs` | `Navigate to /my-college` | Backward-compatible alias redirecting seamlessly to My College. |
| `/college`, `/about` | `Navigate to /my-college` | Pruned dead marketing routes and consolidated into institutional hub. |
| `/announcements`, `/gallery` | `Navigate to /explore` | Pruned redundant subpages; event updates are surfaced directly on event pages. |
| `/attendee/dashboard` | `AttendeeDashboardPage` | Simplified attendee portal. Contains strictly the **Collegiate Student ID Card** and **Tactile Boarding Passes**. Certificates and club tabs pruned. |
| `/admin/*` | `AdminLayout` / Studio | Full Organizer & Administration workstation. Accessible directly via the Header Squircle dropdown. |

---

## 5. Header & Navigation Specs

1. **Brand Identity:** High-contrast wordmark with CTU institutional kicker (`[EVENTMESH] · CTU`).
2. **Desktop Center Navigation:**
   - `Home` (`/`)
   - `Explore` (`/explore`)
   - `Calendar` (`/calendar`)
   - `My College` (`/my-college`)
3. **Right Action Cluster:**
   - **Tactile Search Button (`⌘K`):** Global command palette trigger.
   - **`My Passes` Button:** Replaced the legacy standalone `🎫` emoji with an architectural tactile button `<Ticket size={15} /> <span>My Passes</span> <span className="dot" />` positioned to the immediate left of the profile squircle.
   - **Profile Squircle (`12px` rounded):** Displays user initials `SN` or avatar. On click, toggles an editorial dropdown containing:
     - User identity card (`Suraj Naik`, `ceosuraj@email.com`, `Organizer / Passholder` badge)
     - `My Profile` (`/attendee/dashboard?tab=profile`)
     - `My Tickets & Passes` (`/attendee/dashboard?tab=passes`)
     - `My College Hub` (`/my-college`)
     - Divider line
     - `Organizer Studio (Admin Desk →)` (`/admin`)
     - Divider line
     - `Appearance` (Embedded `ThemeToggle` light/dark switch)
     - `Sign Out` button
4. **Mobile Navigation:**
   - Top solid header with search trigger and hamburger drawer.
   - Bottom tactile navigation bar: `Home`, `Explore`, `Calendar`, `My College`, `Passes`.

---

## 6. Physical & Tactile Micro-Interactions

1. **Digital Student ID Card (`StudentIDCard2D`):**
   - Clean architectural boarding-card form factor.
   - Embedded QR code linking to verifiable attendee record `usr-suraj`.
   - Clear student metadata: Roll No `CTU-2026-0814`, Dept of Computer Science & Engineering, Semester 6, Blood Group `O+`.
   - Interactive flip action to reveal emergency contact and verified security barcode.
2. **Tactile Boarding Pass (`TactileBoardingPass`):**
   - Perforated ticket tearing physics with realistic spring dynamics (`framer-motion`).
   - High-impact admission stamp with weighted bounce and settling vibration.
   - Zero layout shift, DOM clipping, or arcade flash.

---

## 7. Verification Checklist

- [x] TypeScript compilation: `npm run typecheck` passed with **0 errors**.
- [x] Unit & component test suite: `vitest run` passed **60 / 60 tests** across 18 test suites.
- [x] Production build: `npm run build` completed cleanly in 15.35s with chunking and minification.
- [x] Mirrored repositories synchronized: `eventmesh/frontend/` and `eventmesh-frontend/` in 100% parity.
