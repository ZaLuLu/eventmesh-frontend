# EventMesh Frontend: Comprehensive HD Feature Snapshot Index

> **Date**: October 2026  
> **Repository**: `ZaLuLu/eventmesh-frontend`  
> **Capture Standard**: **High Definition (Retina 2x Scale Factor, 2880px / 3840px crisp renders)**  
> **Design Language**: **Electric Cobalt Blue (`#0047FF`) & Paper White (`#FFFFFF`) Swiss Modernist System**  
> **Total Snapshots**: **56 Detailed HD Captures across all 12 Feature Domains**

---

## Executive Summary

All features across the EventMesh frontend platform have been systematically audited and captured in **Ultra High Definition (HD Retina 2x)**. Rather than storing flat unstructured dumps, each set of snapshots is located directly inside its respective feature folder in `src/features/<feature>/snapshots/`, accompanied by a dedicated `README.md` catalog detailing states, viewports, and visual design tokens.

---

## Feature Directory Catalog

| Feature Domain | Feature Path | Snapshot Directory | Key States & Snapshots Captured |
|---|---|---|---|
| **1. Events & Discovery** | [`src/features/events`](file:///home/wafiq/coding/eventmesh-frontend/src/features/events) | [`snapshots/`](file:///home/wafiq/coding/eventmesh-frontend/src/features/events/snapshots) | Full-page Home, Hero navigation, 3-tier Admission Matrix, Tactile Ticket Pass (Intact & Torn with confetti), Explore Grid & List views, Event Detail overview & schedule, Mobile viewports. |
| **2. Registration & Checkout** | [`src/features/registration`](file:///home/wafiq/coding/eventmesh-frontend/src/features/registration) | [`snapshots/`](file:///home/wafiq/coding/eventmesh-frontend/src/features/registration/snapshots) | Multi-tier pass selector, pricing breakdown, interactive tier selection, FormRenderer custom fields, and mobile layout. |
| **3. Clubs & Organizations** | [`src/features/clubs`](file:///home/wafiq/coding/eventmesh-frontend/src/features/clubs) | [`snapshots/`](file:///home/wafiq/coding/eventmesh-frontend/src/features/clubs/snapshots) | 9 autonomous collectives directory, search & category chips, DevCraft club profile, BellToggle notifications, roster & activity gallery, mobile view. |
| **4. Calendar** | [`src/features/calendar`](file:///home/wafiq/coding/eventmesh-frontend/src/features/calendar) | [`snapshots/`](file:///home/wafiq/coding/eventmesh-frontend/src/features/calendar/snapshots) | Full-page month grid, color-coded event markers, day selection agenda popup, and mobile agenda scrubber. |
| **5. Announcements** | [`src/features/announcements`](file:///home/wafiq/coding/eventmesh-frontend/src/features/announcements) | [`snapshots/`](file:///home/wafiq/coding/eventmesh-frontend/src/features/announcements/snapshots) | Campus alert feed, priority tags, timestamp indicators, and broadcast notices. |
| **6. Campus Gallery** | [`src/features/gallery`](file:///home/wafiq/coding/eventmesh-frontend/src/features/gallery) | [`snapshots/`](file:///home/wafiq/coding/eventmesh-frontend/src/features/gallery/snapshots) | Photography archive mosaic, event recap albums, category filters, and high-res photo tiles. |
| **7. About Platform** | [`src/features/about`](file:///home/wafiq/coding/eventmesh-frontend/src/features/about) | [`snapshots/`](file:///home/wafiq/coding/eventmesh-frontend/src/features/about/snapshots) | Technical Association mission, platform architecture, executive coordinator profiles, and open-source principles. |
| **8. Certificates** | [`src/features/certificates`](file:///home/wafiq/coding/eventmesh-frontend/src/features/certificates) | [`snapshots/`](file:///home/wafiq/coding/eventmesh-frontend/src/features/certificates/snapshots) | Cryptographic verification portal (`/verify/TA-2026-001245`), SHA-256 seal, issuer metadata, and verifiable credential card. |
| **9. Authentication** | [`src/features/auth`](file:///home/wafiq/coding/eventmesh-frontend/src/features/auth) | [`snapshots/`](file:///home/wafiq/coding/eventmesh-frontend/src/features/auth/snapshots) | Student SSO login portal, and one-click Dev Accounts switcher for all 7 role personas. |
| **10. Attendee Dashboard** | [`src/features/dashboard`](file:///home/wafiq/coding/eventmesh-frontend/src/features/dashboard) | [`snapshots/`](file:///home/wafiq/coding/eventmesh-frontend/src/features/dashboard/snapshots) | Student metadata bento, interactive 3D physics Lanyard Student ID badge (Three.js WebGL), double-sided Boarding Passes, floating modal ticket pass (Intact & Torn), Certificates tab, Followed Clubs tab, and mobile responsive view. |
| **11. Admin Console** | [`src/features/admin`](file:///home/wafiq/coding/eventmesh-frontend/src/features/admin) | [`snapshots/`](file:///home/wafiq/coding/eventmesh-frontend/src/features/admin/snapshots) | Platform Admin overview & KPIs, Events Directory data table, Event Creation Wizard, Check-in Turnstile Gate Scanner, Attendee Registry, Certificates Manager, Broadcast Composer, Club Profiles, RBAC Staff Matrix, Approvals Queue, Analytics Reports, Audit Logs, Settings, and Mobile Admin. |
| **12. Design System Styleguide** | [`src/features/styleguide`](file:///home/wafiq/coding/eventmesh-frontend/src/features/styleguide) | [`snapshots/`](file:///home/wafiq/coding/eventmesh-frontend/src/features/styleguide/snapshots) | Electric Cobalt & Paper White tokens, Plus Jakarta Sans display typography, JetBrains Mono tabular numerals, buttons, badges, dialogs, and micro-interactions. |

---

## Snapshot Standards & Technical Verifications

- **2x Retina High Definition**: Captured at `deviceScaleFactor: 2`, delivering crisp 2880px / 3840px renders where text, borders, and UI micro-details are razor sharp.
- **Full Viewport Flexibility**: Both desktop full-page scrolls and mobile device viewports (iPhone 14 / 390x844 Retina) are represented.
- **Physical Cardstock Design**: Validated the complete removal of neon glows and sci-fi beams, transitioning to authentic white cardstock paper textures, cobalt check-in stubs, and natural perforation tears.
- **Autonomous Replication**: The automation script [`scripts/capture-all-feature-snapshots.cjs`](file:///home/wafiq/coding/eventmesh-frontend/scripts/capture-all-feature-snapshots.cjs) can be re-run at any time to regenerate fresh visual baselines.
