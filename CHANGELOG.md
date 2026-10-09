# EventMesh Frontend Rebuild Changelog — "Calm Coral" Theme

## Executive Summary
The entire visual and presentation layer of EventMesh has been rebuilt with a clean, minimal, flat design system called **"Calm Coral"**.
All underlying API layers (contracts, ports, adapters, mock databases), routing hierarchy, data models, role-based permissions, and feature behaviors were preserved with zero regressions.

---

## 1. What Was Removed

### A. Non-Flat Visual Artifacts & Gimmicks
- **Glassmorphism & Blurs**: Removed all instances of `backdrop-blur`, `backdrop-filter`, and translucent glass containers.
- **Neomorphism & Gradients**: Removed all neomorphic soft shadows (`shadow-neo`, `neo-inset`, `neo-pill`, `neo-card`), dual lighting highlights, and gradient fills across cards, headers, tags, chips, and buttons.
- **3D & Perspective**: Removed 3D card tilts, `transform-style: preserve-3d`, `perspective`, and `rotateX`/`rotateY` transforms.
- **Decorative 3D Carousels**: Replaced the previous 3-card angled carousel with an accessible, flat, single-slide featured carousel with arrow controls and indicators.

### B. Chrome Clutter & Header Distractions
- **Header Badges**: Removed extraneous marketing badges ("9 collectives active", "Instant 1-tap passes") from the public header.
- **Developer Tools in Production View**: Removed the persona switcher, console shortcut, and "Sovereign Admin" badge from the public navigation header. The persona switcher is relocated strictly to `/dev/accounts` for mock development.
- **Role Exposure**: The "Dashboard" link in the top nav appears only when the active session possesses staff or admin permissions.

### C. Arbitrary Spacing & Typography Violations
- **Sub-13px Typography**: Systematically eliminated all text sizes below 13px (e.g. `text-[10px]`, `text-[11px]`, and `text-xs` 12px), standardizing to `text-caption` (13px) and `text-small` (14px).
- **All-Caps Display Labels**: Removed aggressive uppercase letter-spaced styling across buttons, badges, chips, and table headers in favor of clean, human-readable sentence case.
- **Decorative Viewport Spacers**: Removed decorative empty bands, `100vh` spacer sections, and oversized gutters.

---

## 2. What Was Rebuilt

### A. Design Tokens & Primitives (`src/design-system/`)
Mapped through CSS variables into Tailwind CSS:
- `--bg: #FBFAF8`, `--surface: #FFFFFF`, `--subtle: #F3F1ED`, `--line: #E7E4DE`
- `--text: #1B1A19`, `--text-2: #5E5A55`, `--text-3: #8A857E`
- `--accent: #C93E27`, `--accent-hover: #B33620`, `--accent-soft: #FDEBE6`, `--on-accent: #FFFFFF`
- `--success: #1E7A4C`, `--warning: #A85F00`, `--danger: #B42318`
- Admin scope (`.admin-scope`): `--bg #F3F5F6`, `--surface #FFFFFF`, `--sidebar #0F1A24`, `--accent #17645F`, `--accent-hover #0F4F4B`

**Primitive Components:**
- **`Button`**: Flat solid colors (Primary `--accent`, Secondary `--subtle`, Tertiary link `--accent`). 48px standard, 56px hero, 40px compact, 36px admin. 2px visible focus ring, no lift/shadow on hover.
- **`Chip`**: Flat pill filters (`--subtle` background; active is `--accent-soft` with `--accent` text). Minimum 40px height desktop, 44px mobile.
- **`Field` / `Select`**: 48px height, solid `--surface` background, 1px `--line` border, 2px `--accent` focus ring. Helper and validation errors in 13px (`text-caption`).
- **`Tabs`**: Clean text tabs with a 2px solid accent underline indicator on the active tab.
- **`Table`**: Dense administrative tables with 52px rows, sticky header in `--subtle`, 1px hairlines, and hover in `--subtle`.
- **`Modal` & `Sheet`**: Solid `--surface` dialogs, mobile bottom sheet with 16px top radius, backed by `--text/40` overlay and floating shadow `0 4px 16px rgba(27,26,25,0.08)`.
- **`Toast`**: High-contrast solid `--text` notification with white text and floating shadow.
- **`Skeleton`**: Subtle opacity pulse without shimmering gradient overlays.
- **`EmptyState` & `ErrorState`**: Compact (≤240px tall) feedback states.

### B. Vendor Component Isolation & Wrapping
- **Vendor File**: `src/vendor/ui/coral-dawn.jsx` from FeralUI was preserved untouched.
- **Wrapper**: `src/design-system/GradientBackdrop.tsx` encapsulates Coral Dawn as an `aria-hidden="true"`, `pointer-events-none`, absolutely positioned layer.
- **Safety Fallback**: Wrapped in an error boundary that falls back to solid `#FDEBE6`.
- **Performance & A11y**: Automatically freezes animation when `document.hidden` is true (background tab) or when `(prefers-reduced-motion: reduce)` is enabled.
- **Contrast Protection**: Small body text is strictly prevented from resting directly on the gradient; all text sits on solid surfaces (`--surface`).
- **TypeScript**: Created `src/vendor/ui/coral-dawn.d.ts` for clean type resolution without altering the vendor code.

### C. Public Shell & Navigation (`src/app/PublicShell.tsx`)
- Header rendered in two clean rows: Row 1 (64px) with plain wordmark, city selector, centered search bar (44px), and user account menu; Row 2 (44px) with primary links (Explore, Clubs, Calendar, My tickets) with 2px accent underline.
- Sticky header + filter row stack height restricted to ≤ 120px on mobile.
- Mobile bottom navigation bar (56px) for thumb navigation.
- Compact footer (≤ 200px desktop) with 4 link columns and copyright line.

### D. Rebuilt Public Pages
- **Home (`HomePage.tsx`)**: Hero banner (max 440px desktop) with `GradientBackdrop`, followed by sticky filter bar (16px gap), Trending this week, Upcoming events, Clubs spotlight row, and Announcements list.
- **Explore (`ExplorePage.tsx`)**: Responsive layout with desktop sidebar filters and mobile bottom sheet; results count and sort controls aligned on one line; 4-col (1280px+), 3-col (1024px), 2-col (640px), 1-col scrollable (<640px) grids.
- **Event Detail (`EventDetailPage.tsx`)**: Flat cover preview (max 360px), two-column layout on desktop (details left, sticky registration panel right), sticky mobile bottom action bar with status and Register button, text tabs for About, Schedule, Speakers, Rules, and Contact.
- **Register (`RegisterPage.tsx`)**: Two-column layout on desktop (form max 560px left, order summary panel right) to prevent empty gutters.
- **Calendar (`CalendarPage.tsx`)**: Full container width monthly calendar grid paired with side list of selected day's events.
- **Clubs (`ClubsPage.tsx`, `ClubDetailPage.tsx`)**: Grid of technical collectives with 10px club indicator dots, followed by club profile, active events, and archives.
- **Announcements (`AnnouncementsPage.tsx`)**: Filterable broadcast list with soft pinned tags and date metadata.
- **Attendee Dashboard (`AttendeeDashboardPage.tsx`)**: Multi-tab management for active passes and verifiable credentials.
- **Verify Certificate (`VerifyCertificatePage.tsx`)**: Instant cryptographic certificate verification portal.
- **Gallery (`GalleryPage.tsx`)**: Responsive photo archive with club tags.
- **Styleguide (`StyleguidePage.tsx`)**: Comprehensive living design system showcase featuring all tokens, typography scales, buttons in all variants and states, chips, inputs, tabs, table, modal, sheet, toast, and the Coral Dawn hero backdrop.

### E. Rebuilt Admin Console (`src/app/AdminShell.tsx` & `src/features/admin/`)
- Styled with dedicated admin tokens (`--bg #F3F5F6`, `--surface #FFFFFF`, `--sidebar #0F1A24`, `--accent #17645F`).
- Permanent 28px top ADMIN strip indicating active role and environment.
- 56px administrative top bar with notifications and profile menu.
- Full-width dense tables with sticky headers, inline search and filter controls.
- Event creation wizard (`AdminEventWizardPage.tsx`) with dense two-column form steps.
- Real-time check-in gate terminal (`AdminCheckinPage.tsx`) with barcode scanner and manual entry.
- Approvals, certificates, announcements, gallery, and settings management consoles.

---

## 3. Automated Layout Audit (`npm run audit:layout`)
Implemented in `tests/e2e/layout-audit.spec.ts`:
- Tested at viewports: **360px (mobile)**, **768px (tablet)**, **1280px (desktop)**, and **1920px (wide)**.
- **Checks Enforced:**
  1. `scrollWidth <= clientWidth + 1` (zero horizontal page scroll).
  2. Vertical gap between consecutive top-level sections strictly ≤ 64px.
  3. No section taller than 1.5 viewport heights while mostly empty.
- Verified across all public and administrative routes.

---

## 4. Before & After Comparative Analysis

| Dimension | Previous Implementation | Rebuilt "Calm Coral" Standard |
|---|---|---|
| **Visual Style** | Heavy neomorphism, inset bevels, blurred glassmorphism (`backdrop-blur-md`), competing gradients. | Flat, minimalist aesthetic. Solid colors for all UI elements. 1px hairlines in `--line`. Single light shadow for floating layers only. |
| **Gradients** | Gradients on buttons, cards, text, badges, and headers. | Exactly ONE gradient on the public site: the Coral Dawn hero backdrop, wrapped in `GradientBackdrop.tsx`. |
| **Typography** | Varied system fonts, aggressive uppercase tracking, 10px-12px micro-text. | Inter variable font in sentence case. Strict floor: **nothing below 13px anywhere**. Maximum 3 font sizes per card/row. |
| **Vertical Rhythm** | Inconsistent gaps (80px–120px), decorative empty space, tall blank sections. | Controlled vertical rhythm: 40px (mobile), 48px (tablet), 56px (desktop). Never more than 64px between adjacent blocks. |
| **Layout Density** | Narrow centered forms with huge gutters; orphan cards. | Full-width utilization. 2-column forms with summary panels. 4/3/2/1 responsive event grids. Compact 52px admin tables. |
| **Header Chrome** | Crowded with dev badges ("9 collectives active", "Sovereign Admin", persona switcher). | Clean 64px wordmark + search + user row, 44px primary navigation row. Dev controls relegated to `/dev/accounts`. |
| **Accessibility & Contrast** | Low contrast text on tinted glass, small tap targets. | WCAG AA compliant (all text ≥ 4.5:1), 44px touch targets on mobile, 2px visible focus ring, prefers-reduced-motion support. |

---

## 5. Engineering Assumptions & Recorded Decisions
1. **Club Color Application**: In accordance with the spec, club colors are strictly restricted to 10px indicator dots, small solid chips, or 4px solid top edges on event cards. They are never used as full page backgrounds or large bands.
2. **Shadows**: Shadows are completely removed from all stationary UI elements (cards, hero panels, buttons, inputs, summary boxes). The single allowed floating shadow (`0 4px 16px rgba(27,26,25,0.08)`) is applied only to dropdown menus, popovers, bottom sheets, modals, and toasts.
3. **Date Formatting**: `formatDate`, `formatDateTime`, and `formatTime` were updated to output sentence-case strings (e.g. "8 Oct 2026") rather than uppercase strings ("OCT 8, 2026") to comply with sentence-case typography requirements.
4. **Dev Accounts Route**: Preserved and updated `/dev/accounts` with explicit role buttons ("DevCraft Lead", "Volunteer", "Platform Admin", etc.) ensuring all existing Playwright smoke tests pass without changes to test logic.
