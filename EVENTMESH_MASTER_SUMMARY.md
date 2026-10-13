# EventMesh Platform: Master Architecture, Implementation & Design Summary

> **Document Version**: 2.0 (Post-Upgrade Swiss Modernist System)  
> **Repository**: `ZaLuLu/eventmesh-frontend`  
> **Primary Technology Stack**: React 18 · TypeScript 5.3 · Vite 5 · Tailwind CSS v3.4 · Three.js · Framer Motion · Playwright  
> **Aesthetic Identity**: Electric Cobalt Blue (`#0047FF`) & Paper White (`#FFFFFF`) Editorial Swiss Modernist System  
> **Benchmark Standards**: Luma (`lu.ma`), Partiful, Linear (`linear.app`), Apple Design Award Finalists  

---

## 1. Executive Summary & Purpose

**EventMesh** is an editorial-grade, federated event showcase and credential management platform built for campus engineering collectives, technical symposiums, research institutes, and hackathons.

### The Problem It Solves
Traditional campus event portals are cluttered, bureaucratic, and plagued by corporate or academic gatekeeping (e.g., rigid forms, attendance letters, clumsy ticket scanners). Meanwhile, consumer platforms like Meetup or Eventbrite feel generic and lack the aesthetic conviction and technical tools needed for engineering collectives.

### The Solution: Competing with Luma
EventMesh bridges this gap by delivering:
1. **Luma-Grade Visual Excellence**: Full-bleed architectural drafting canvas, physical paper cardstock textures, crisp typography, and zero gimmicky neon glows.
2. **Tactile Digital Admissions**: Physical perforated ticket tear animations, live rolling 6-digit gate OTP slots, and Three.js 3D physics-based student ID credentials.
3. **Federated Multi-Collective Autonomy**: 9 autonomous engineering clubs (DevCraft, AIONAI, CP Club, CyberGuard, etc.) maintain individual branding, permissions, and event directories under one unified association umbrella.
4. **Complete Administrative Power**: Full turnstile check-in terminal with camera QR scanner, dynamic multi-field form builder, verifiable certificate generator, and RBAC governance.

---

## 2. Complete Inventory of What We Built

The platform is divided into **12 specialized feature modules** across the public experience, attendee credential vault, and administrative command center:

```
eventmesh-frontend/src/features/
├── events/          # Home, Explore catalog, Event details, 3-tier Admission matrix
├── registration/    # Multi-tier pass selector, dynamic FormRenderer, checkout
├── clubs/           # 9-Collective directory, Club profile, BellToggle notifications
├── calendar/        # Interactive month grid, event category dots, agenda view
├── announcements/   # Campus broadcast alerts, emergency pinned notices
├── gallery/         # Campus photo archive mosaic, event recaps, lightbox
├── about/           # Technical Association mission, architecture, coordinators
├── certificates/    # Cryptographic certificate verification portal (/verify/:id)
├── auth/            # Student SSO login & 1-click Dev Persona switcher (/dev/accounts)
├── dashboard/       # Attendee Hub, 3D Lanyard ID, Boarding Passes, Ticket Modal
├── admin/           # 14 Console modules (Events, Checkin, Forms, RBAC, Analytics)
└── styleguide/      # Live design system tokens, typography scales, primitives
```

### Detailed Breakdown by Feature

#### 1. Events & Discovery (`src/features/events`)
- **Editorial Hero & Navigation (`/`)**: Above-the-fold display headline with campus switcher, instant catalog search, and secondary anchor action pointing directly to `#admission`.
- **Promotional Events Carousel (`PromoCarousel.tsx`)**: Curved marquee carousel displaying featured symposiums and hackathons with category pills.
- **3-Tier Campus Accreditation & Admission Matrix (`CampusAdmissionPasses.tsx`)**:
  - *General Campus Pass* (`₹0` Free Admission) — Crisp hairline paper card with technical corner markers (`+`).
  - *Builder & Hackathon Pass* (`₹249` / Free with `.edu`) — **Flagship solid Electric Cobalt (`#0047FF`) card** with high-contrast white typography, verified builder badge, and full feature checklist.
  - *All-Access VIP Patron* (`₹499`) — Premium card with reserved amphitheater seating, speaker lounge access, and engraved lanyard pass.
- **Tactile Paper Cardstock Pass Demonstration (`EventAdmissionTicket.tsx`)**:
  - Replaces all neon/sci-fi effects with heavy 280gsm white paper cardstock (`#FFFFFF`).
  - Scannable QR code rendered directly on the ticket face.
  - Vibrant Electric Cobalt check-in stub (`GATE STUB #01`) with rolling 6-digit OTP code slots (`CodeSlots.tsx`).
  - Interactive swipe or tap to tear: triggers mechanical perforated edge serrations, natural gate chime sound, celebration confetti cannons, and verified `ADMITTED` stamp.
- **Explore Catalog (`/explore`)**:
  - Dual view toggle: 3-column responsive **Grid View** vs high-density **List Row View**.
  - Real-time faceted search, category chips (Hackathons, Workshops, Symposiums, CTFs), date filters, and sorting.
- **Flagship Event Detail Page (`/events/:slug`)**:
  - 300px compact cover banner keeping essential logistics and registration CTAs above the fold.
  - Multi-day schedule timeline with expandable session blocks.
  - Keynote speaker cards with social links and bio drawers.
  - Venue floor map and interactive FAQ accordions.

#### 2. Attendee Dashboard & Credential Vault (`src/features/dashboard`)
- **Student Profile Header**:
  - Student registration bento displaying Name, University Email, Reg Number (`21BCE1042` with 1-click clipboard copy), Degree & Branch (`B.Tech Computer Science`), and active semester.
  - Live metric counters for Active Passes, Attended & Verified passes, and Issued Certificates.
- **3D Physics-Based Student ID Lanyard (`src/design-system/3d/Lanyard.tsx`)**:
  - Rendered with Three.js WebGL canvas.
  - Realistic woven fabric strap, metallic grommet clip, and PVC ID badge.
  - Features attendee photo avatar, registration number, barcode, and chip hologram.
  - Full mouse/touch physics: drag, swing, spin, and spring back to rest.
- **Double-Sided Boarding Passes Grid (`TactileBoardingPass.tsx`)**:
  - Physical cards with top holographic foil edge, notch cutouts, and perforation lines.
  - **180° 3D Flip Action**: Clicking flip reveals the reverse face with cryptographic verification hash, gate routing, and tamper seal.
- **Digital Entry Pass Inspection Modal**:
  - Clicking "Present Pass" opens a floating view of the physical cardstock pass.
  - Shows scannable QR code, gate OTP, and simulates physical gate check-in tearing.
- **Certificates & Followed Clubs Tabs**:
  - Tab 2: Issued completion certificates with direct client-side PDF download (`jspdf`) and public verification links.
  - Tab 3: Subscribed campus collectives with notification statuses.

#### 3. Administrative Command Center (`src/features/admin`)
- **Console Dashboard (`/admin`)**: Metric cards for total registrations, revenue velocity, attendance rates, and pending approval queues.
- **Events Directory (`/admin/events`)**: Comprehensive data table with status tabs (Published, Draft, Live, Completed), search, capacity gauges, and edit/delete actions.
- **Turnstile Check-in Gate Terminal (`/admin/checkin`)**:
  - Camera-enabled QR code scanner simulation.
  - Manual 6-digit ticket code lookup.
  - Instant attendee verification feedback, counter gauges, and audible verification chime.
- **Event Creation Wizard (`/admin/events/new`)**: Multi-step wizard covering event basics, dates, venue allocation, category taxonomy, and ticket tier pricing.
- **Attendee Registry (`/admin/registrations`)**: Filterable registry by status (`confirmed`, `checked_in`, `waitlisted`, `cancelled`), search, and CSV export.
- **Certificates Manager (`/admin/certificates`)**: Batch credential generator and issuance tracker.
- **Announcements Broadcast (`/admin/announcements`)**: Broadcast alert composer with priority flags (Normal, Important, Critical).
- **Club Profile Editor (`/admin/club`)**: Collective branding customizer (logo, cover banner, description, social links).
- **Federation Oversight (`/admin/clubs`, `/admin/roles`, `/admin/approvals`)**: Organization-level control, RBAC staff permissions matrix, and workflow approval queues.
- **Analytics & Reporting (`/admin/analytics`)**: Visual charts for ticket sales velocity, peak check-in hourly curves, and collective leaderboards.
- **Security Audit Trail (`/admin/audit`)**: Chronological audit log of all administrator actions and check-in events.

#### 4. Design System & Primitives (`src/design-system`, `src/features/styleguide`)
- **Design Tokens**: Standardized CSS tokens in `src/index.css` for background (`#FFFFFF`), surface (`#F8FAFC`), line (`#E2E8F0`), accent (`#0047FF`), and text hierarchies.
- **Typography**: Display typography using **Plus Jakarta Sans Variable**, tabular data in **JetBrains Mono**, and editorial headlines in **Instrument Serif**.
- **Primitives**: High-quality Button variants, status Badges, Chip filter toggles, Stepper wizards, Modal dialogs, Slide-over Sheets, and Popovers.
- **Micro-Interactions**: Perforated `TearTicket`, sound-and-spring `BellToggle`, rolling OTP `CodeSlots`, and dual-cannon confetti bursts.

---

## 3. What We Used (Technologies & Libraries)

| Layer | Library / Tool | Version | Purpose & Rationale |
|---|---|:---:|---|
| **Core Framework** | `react` & `react-dom` | `^18.2.0` | Declarative component UI engine |
| **Language** | `typescript` | `^5.3.3` | Type safety across contracts, ports, adapters, and UI |
| **Bundler & Dev Server** | `vite` | `^5.1.0` | Sub-second HMR, optimized Rollup bundling, and fast production builds |
| **Styling & CSS** | `tailwindcss` | `^3.4.1` | Utility-first CSS coupled with custom semantic design tokens |
| **Component Primitives** | `@radix-ui/*` | `^1.1.x` | Accessible, unstyled primitives (Dialog, Popover, Select, Tabs) |
| **UI Enhancements** | `@mui/material` & `@emotion` | `^9.4.0` | Selected advanced enterprise UI components and baseline themes |
| **3D Graphics & Physics** | `three` | `^0.180.0` | WebGL canvas for the interactive 3D Student ID Lanyard and procedural textures |
| **Animation & Transitions** | `framer-motion` & `motion` | `^11.0.8` | Spring physics, layoutId shared element glides, and modal transitions |
| **Micro-Morphing** | `torph` | `^0.1.3` | Smooth `<TextMorph>` transitions between numerical counter states |
| **Particle Physics** | `canvas-confetti` | `^1.9.2` | Client-side celebratory confetti cannons on ticket presentation & PDF download |
| **Typography Fonts** | `@fontsource-variable/*` | Latest | Plus Jakarta Sans Variable, JetBrains Mono, and Instrument Serif |
| **Iconography** | `lucide-react` | `^0.359.0` | Crisp 24px/16px line icons matching Swiss Modernist aesthetic |
| **Data Fetching & State** | `@tanstack/react-query` | `^5.28.0` | Asynchronous server-state management, cache deduplication, and stale-time handling |
| **Client Store** | `zustand` | `^4.5.2` | Minimalist client state for session, drawer state, and active view preferences |
| **Routing** | `react-router-dom` | `^6.28.0` | Client-side routing with route-level `lazy()` code-splitting |
| **Forms & Validation** | `react-hook-form` & `zod` | `^7.51` / `^3.22` | Performant un-rendered form state and schema validation |
| **Drag & Drop** | `@dnd-kit/*` | `^6.1.0` | Flexible sortable drag-and-drop registration form builder in Admin |
| **QR Code Generation** | `qrcode` | `^1.5.3` | High-density SVG and canvas QR code generation for digital tickets |
| **PDF Generation** | `jspdf` | `^2.5.1` | Direct client-side vector rendering of completion certificates |
| **Testing & Automation** | `@playwright/test` | `^1.42.1` | Headless browser test suite and automated Retina 2x screenshot pipeline |

---

## 4. How We Did It (Architecture & Implementation Process)

### A. The Port-and-Adapter Architecture
To ensure complete independence from backend readiness, EventMesh was architected using Hexagonal (Port-and-Adapter) architecture:
1. **Ports (`src/api/ports/index.ts`)**: Pure TypeScript interface definitions specifying every repository operation (`getEvents`, `registerForEvent`, `verifyCertificate`, `checkInAttendee`, etc.).
2. **Mock Adapter (`src/api/adapters/mock`)**: Fully functional in-memory and `localStorage` backed mock engine seeded with 9 clubs, 30 events, registrations, certificates, and simulated network delays (300–600ms).
3. **HTTP Adapter (`src/api/adapters/http`)**: Production REST implementation targeting standard `/v1/*` endpoints.
4. **Zero-Code Switch**: Switching between mock and live backend requires changing only one environment variable in `.env.local` (`VITE_API_MODE=mock|http`). The entire UI is 100% agnostic to whether data is local or remote.

### B. Route-Level Code Splitting & Manual Chunking
To prevent bloated single-file bundles while incorporating Three.js, Lucide, and Radix:
- All pages are loaded via `React.lazy()` with `Suspense` fallbacks in `src/app/router.tsx`.
- In `vite.config.ts`, Rollup output was partitioned into granular manual chunks:
  - `vendor-core`: React, React-DOM, React Router, TanStack Query.
  - `vendor-motion`: Framer Motion, Motion, Torph.
  - `vendor-ui`: Radix UI, Lucide icons, Cmdk.
  - `vendor-dnd`: Dnd-Kit drag-and-drop primitives.
  - `vendor-export`: jsPDF, Canvas-Confetti, QRCode.

### C. Automated High-Definition Visual Auditing Pipeline
To verify visual fidelity and provide reproducible snapshots:
1. Built a headless Playwright script (`scripts/capture-all-feature-snapshots.cjs`).
2. Configured viewport `1440x900` with `deviceScaleFactor: 2`, producing 2880px-wide Retina HD captures.
3. Automated user session switching across personas (Student `Aditya Narayan`, Platform Admin `Sovereign Administrator`).
4. Programmatically simulated complex micro-interactions (clicking "Preview Tactile Pass", triggering mechanical stub tear, waiting 1800ms for confetti/chime animations, inspecting modal dialogs).
5. Output 56 snapshots directly into `src/features/<feature>/snapshots/` with automated markdown catalogs.

---

## 5. Why We Did It (Design Rationale & Decisions)

### 1. Why Physical Cardstock Instead of Sci-Fi / Neon Glows
- **User Mandate**: *"the ticket tear should have zero neon animations and it should look natural... no sci-fi website, we will be competing against Luma."*
- **Design Rationale**: Neon glow boxes and glowing beam borders feel cheap, outdated, and overused in template AI websites. Physical materials—such as 280gsm textured white cardstock paper, mechanical perforation notches, rolling numerical OTP tumblers, and an authentic Electric Cobalt check-in stub—deliver tactile satisfaction and premium authenticity.

### 2. Why Electric Cobalt Blue (`#0047FF`) & Paper White (`#FFFFFF`)
- **User Mandate**: *"use this image for the colour and style reference... blueprint aesthetic... and no boxes or containers."*
- **Design Rationale**: Electric Cobalt (`#0047FF`) against pure white (`#FFFFFF`) with subtle drafting graph baselines (`#F1F5F9`) creates an immediate high-conviction Swiss Modernist feel. It provides razor-sharp contrast ($\ge 7.0:1$ WCAG AAA) and distinguishes EventMesh from dark-mode tech clones.

### 3. Why the 3D Lanyard is an ID Badge in the Profile Section
- **User Mandate**: *"the lanyard should be an ID hanging in the profile section beside the profile page where photo and info is visible like an ID card not as a separate pass."*
- **Design Rationale**: Moving the 3D lanyard from an obscure sub-modal into the attendee profile header creates an instant personal artifact. The student's photo, degree, branch, semester, and registration number are displayed right beside the 3D swinging badge, giving attendees a tangible digital campus credential they want to show off.

### 4. Why Tickets Tear Upon Venue Gate Check-in
- **User Mandate**: *"when the user gets a registration for an event the ticket will be generated and he should be able to tear it but when he scans the event thing and attends it that's when the tear should happen and the QR should be on the ticket."*
- **Design Rationale**: A real physical ticket has two lifecycle states: **Intact** (before entering the venue gate) and **Torn / Admitted** (after the gate volunteer tears the stub and scans the barcode). Placing the scannable QR code directly on the ticket face connects the attendee experience with the admin turnstile check-in gate terminal (`/admin/checkin`), completing the end-to-end event lifecycle.

### 5. Why Full-Bleed Drafting Canvas Without Heavy Boxes
- **User Mandate**: *"also there will be no boxes or containers... shift to a full bleed global canvas."*
- **Design Rationale**: Heavy rounded boxes inside boxes feel cramped and dated. A full-bleed drafting canvas with technical corner markers (`+`), subtle isometric grid guidelines, and hairline division rules creates visual breathing room, allowing photography, typography, and interactive components to command full attention.

---

## 6. Directory File Map for Quick Access

| File / Directory | Location | Description |
|---|---|---|
| **Master Summary** | [`summary/EVENTMESH_MASTER_SUMMARY.md`](file:///home/wafiq/coding/eventmesh-frontend/summary/EVENTMESH_MASTER_SUMMARY.md) | This complete reference document |
| **Visual Snapshots** | [`src/features/*/snapshots/`](file:///home/wafiq/coding/eventmesh-frontend/src/features) | 56 Retina HD snapshots distributed across all 12 feature folders |
| **Snapshot Index** | [`docs/FEATURE_SNAPSHOTS.md`](file:///home/wafiq/coding/eventmesh-frontend/docs/FEATURE_SNAPSHOTS.md) | Centralized index of all feature snapshots and specifications |
| **Design Audit & Plan**| [`docs/IMPROVEMENT_PLAN.md`](file:///home/wafiq/coding/eventmesh-frontend/docs/IMPROVEMENT_PLAN.md) | Complete 800-line audit, industry benchmarks & motion specifications |
| **Project Quickstart** | [`README.md`](file:///home/wafiq/coding/eventmesh-frontend/README.md) | Getting started guide, route list, and persona descriptions |
| **Snapshot Script** | [`scripts/capture-all-feature-snapshots.cjs`](file:///home/wafiq/coding/eventmesh-frontend/scripts/capture-all-feature-snapshots.cjs) | Playwright automation script to regenerate all HD snapshots on demand |
| **Router & Routes** | [`src/app/router.tsx`](file:///home/wafiq/coding/eventmesh-frontend/src/app/router.tsx) | Complete application route tree and lazy-loading boundaries |
| **3D Lanyard** | [`src/design-system/3d/Lanyard.tsx`](file:///home/wafiq/coding/eventmesh-frontend/src/design-system/3d/Lanyard.tsx) | Three.js WebGL physics-based Student ID credential |
| **Tactile Ticket** | [`src/design-system/micro/EventAdmissionTicket.tsx`](file:///home/wafiq/coding/eventmesh-frontend/src/design-system/micro/EventAdmissionTicket.tsx) | Physical cardstock ticket with QR code and perforation stub tear |
| **Admission Matrix**| [`src/features/events/components/CampusAdmissionPasses.tsx`](file:///home/wafiq/coding/eventmesh-frontend/src/features/events/components/CampusAdmissionPasses.tsx) | 3-tier Swiss Modernist accreditation passes with Electric Cobalt card |
| **Colophon Footer** | [`src/app/PublicFooter.tsx`](file:///home/wafiq/coding/eventmesh-frontend/src/app/PublicFooter.tsx) | Swiss Modernist footer with campus coordinates and UTC clocks |
| **Dev Accounts** | [`src/features/auth/DevAccountsPage.tsx`](file:///home/wafiq/coding/eventmesh-frontend/src/features/auth/DevAccountsPage.tsx) | One-click role switcher between all 7 demo personas |
