# EVENTMESH v2: PHASE A RECONNAISSANCE REPORT
**Target**: `ZaLuLu/eventmesh-frontend`  
**Identity**: "Campus Funk" Redesign + Hardening  
**Date**: October 13, 2026

---

## 1. Stack Facts & Technical Architecture

- **Runtime & Bundler**: Vite 5.1.0, React 18.2.0, TypeScript 5.3.3.
- **Styling**: Tailwind CSS v3.4.1 (Mandate: stay on v3.4, do not upgrade to v4 during this pass). PostCSS + Autoprefixer.
- **CSS Architecture**: `src/index.css` with CSS custom properties (`--bg`, `--surface`, `--accent`, etc.). Currently uses Plus Jakarta Sans Variable & Inter Variable with JetBrains Mono.
- **Routing**: `react-router-dom` v6.28.0 using `createBrowserRouter` in `src/app/router.tsx` with lazy loading and `Suspense`.
- **State & Data Fetching**: `@tanstack/react-query` v5.28.0, `zustand` v4.5.2 for client stores (`useAuthStore`, `useSoundStore`).
- **Forms & Validation**: `react-hook-form` v7.51.0, `@hookform/resolvers` v3.3.4, `zod` v3.22.4.
- **Animation Stack**:
  - Currently contains **both** `framer-motion` (v11.0.8) and `motion` (v14.0.0). Standardizing on `motion/react`.
  - `torph` v0.1.3 (morphing / layout transitions).
  - `canvas-confetti` v1.9.2.
- **UI Primitives**: Radix UI primitives (`@radix-ui/react-*`), `cmdk` v1.1.1, `embla-carousel-react` v8.6.0.
- **Icons**: `lucide-react` v0.359.0 and `@hugeicons/react`. Transitioning to `@phosphor-icons/react` behind a single `src/design-system/Icon.tsx` wrapper.
- **Testing**:
  - Unit tests: `vitest` v1.3.1 with `jsdom` and `@testing-library/react`.
  - E2E tests: `@playwright/test` v1.42.1.
- **Baseline Build Metrics**:
  - `tsc && vite build`: passes cleanly in ~8.99s.
  - Largest chunks: `AttendeeDashboardPage` (969.4 kB / 275.3 kB gzip), `vendor-motion` (333.4 kB / 113.9 kB gzip), `StyleguidePage` (330.6 kB), `index` (302.8 kB), `vendor-core` (287.0 kB), `vendor-export` (248.2 kB).

---

## 2. Signature Components Deep Dive

### 2.1 `src/design-system/3d/Lanyard.tsx` (Answer to S-04)
- **Dependency Truth**: Depends **only on `three` (^0.186.1) and `@types/three`**.
- It does **NOT** use `@react-three/fiber`, `@react-three/drei`, or `@react-three/rapier`. It uses a standalone Three.js WebGL renderer mounted to a `<canvas>` element with an explicit Euler/Verlet spring-chain constraint physics solver.
- **Hardening Requirements**:
  1. Isolated in a dedicated `vendor-3d` Rollup chunk.
  2. Mounted strictly via `IntersectionObserver` so WebGL stops when off-screen.
  3. Context-loss listeners (`webglcontextlost`, `webglcontextrestored`) with graceful recovery.
  4. Explicit `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`.
  5. Fallback 2D ID Badge for mobile viewports, low-power mode, and `prefers-reduced-motion` (Mandate 2 / F-15).

### 2.2 `src/design-system/micro/EventAdmissionTicket.tsx`
- **Current State**: Generates a natural paper ticket with perforation line (`TearTicket.tsx`), rolling 6-digit OTP slots (`CodeSlots.tsx`), QR code, and audio triggers (`playPaperTearSound`, `playGateAdmissionChime`).
- **Issues Found**:
  - Tear was previously driven by local UI drag/tap or BroadcastChannel event, allowing attendee to tear their own ticket before gate check-in.
  - Violates Mandate 1: "Tickets tear only at venue gate check-in."
- **Hardening Requirements**:
  1. Add explicit `state: 'intact' | 'admitted'` prop driven by backend port (`getTicket()`).
  2. The ticket renders **intact with the QR on the ticket face** after registration.
  3. Tearing occurs **only** when scanned at `/admin/checkin`.
  4. Accessible "Tear stub" button for manual keyboard control, `aria-live` announcements, and text-based status chips (no color-only cues).

### 2.3 `src/features/dashboard/components/TactileBoardingPass.tsx`
- **Current State**: Double-sided 3D flip card with holographic foil header gradient, dashed perforation notch, and 6-digit gate OTP.
- **Hardening Requirements**:
  1. Remove holographic foil gradient and sci-fi aesthetic.
  2. Apply "Campus Funk" warm-paper tokens (`#FFFDF8` card, `#151130` ink, club sticker tint).
  3. Integrate with real ticket state lifecycle and mobile-friendly 2D flip.

---

## 3. Stack Hardening & Dependency Answers

### 3.1 S-01: `@mui/material` and `@emotion/*` Usage
- **Audit Result**: Grep reveals `@mui` is imported in **only 2 files**:
  - `src/design-system/materialTheme.ts`
  - `src/main.tsx` (wrapped in `<ThemeProvider theme={materialTheme}><CssBaseline />`)
- **Action**: Zero UI features or components rely on MUI widgets. Remove `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, delete `materialTheme.ts`, and remove MUI from `main.tsx`.

### 3.2 S-02: Animation Libraries
- **Audit Result**: Both `framer-motion` and `motion` are in `package.json`.
- **Action**: Migrate all imports to `motion/react` (part of `motion` v14), remove `framer-motion` package, eliminating ~150 kB of duplicate bundle weight.

### 3.3 S-03: shadcn Configuration
- **Audit Result**: `components.json` is present with aliases pointing to `@/design-system/ui`. Several primitives exist (`accordion`, `avatar`, `badge`, `command`, `dialog`, `dropdown-menu`, `hover-card`, `popover`, `sheet`, `slider`, `switch`, `tabs`, `tooltip`).
- **Action**: Complete the remaining required primitives (`button`, `drawer`, `toggle-group`, `skeleton`, `sonner`, `select`, `input`, `form`, `chart`) under `@/design-system/ui`.

---

## 4. Complete Audit Verification (Section 2 Items)

| Audit ID | Description | Status | Verification Detail |
|---|---|:---:|---|
| **V-01** | Missing page container on Explore, Event detail, Register, Clubs | **TRUE** | Content sits at x=0; needs unified `PageShell` (max-width 1320px, responsive padding). |
| **V-02** | Same placeholder poster everywhere | **TRUE** | Generic blue wave SVG on all cards; replace with deterministic `PosterArt`. |
| **V-03** | Engineer-speak labels (`01 // EXPLORE`, `RUN-OF-SHOW`, etc.) | **TRUE** | Confirmed in `CampusRadarFeed.tsx`, `HomePage.tsx`, `ExplorePage.tsx`. |
| **V-04** | All-caps event titles | **TRUE** | Titles forced uppercase via CSS or data mapping; switch to Title Case. |
| **V-05** | Footer gimmicks (UTC+05:30 clock, coordinates, design tokens) | **TRUE** | Confirmed in `PublicFooter.tsx:32`. Replace with clean link columns + huge wordmark. |
| **V-06** | Dead layout gaps on Register and Event detail | **TRUE** | Confirmed in snapshots (`fullpage-07-event-register.png`); narrow left column with vast empty right. |
| **V-07** | Breadcrumb and venue truncation | **TRUE** | Confirmed in `EventDetailPage.tsx`; breadcrumbs cut off without wrapping/tooltip. |
| **V-08** | Hero blue slab with faint wave lines, Explore left filter rail takes 1/3 screen | **TRUE** | Confirmed in `HomePage.tsx` and `ExplorePage.tsx`. Replace with Ticket Stack & horizontal chips. |
| **V-09** | Overlong buttons in persona switchers | **TRUE** | Confirmed in `DevAccountsPage.tsx`; button titles wrap to 3 lines. |
| **V-10** | Monospace typography overused | **TRUE** | Confirmed; restrict mono strictly to serials, OTP slots, and verification IDs. |
| **V-11** | Two competing accent colors (Cobalt public vs muddy teal `#17645F` admin) | **TRUE** | Confirmed in `src/index.css:70-73`. Admin gets deliberate Lime `#D4F25A` on dark stage. |
| **V-12** | Clubs index cards have border box, "open" dot, `#01` number | **TRUE** | Confirmed in `ClubsPage.tsx`. Replace with vibrant color-blocked tiles. |
| **V-13** | Admin check-in shows simulate scan buttons, native select, mismatched counts | **TRUE** | Confirmed in `AdminCheckinPage.tsx:173`. Replace with mobile-first scanner. |
| **V-14** | Placeholder seed data looks fake | **TRUE** | Seed has only 1 attendee for a 250-person hackathon; needs enriched realistic dataset. |
| **F-01** | Register form hardcoded to 'Arun Kumar' / 'arun@example.com' | **TRUE** | Confirmed in `RegisterPage.tsx:26-28`. Pre-fill from active auth persona, lock email. |
| **F-02** | Registration form is one long form with weak teammate inputs | **TRUE** | Confirmed in `RegisterPage.tsx:36`. Convert to 3-step stepper with real team invite management. |
| **F-03** | No waitlist, sold-out, or cancellation flow for students | **TRUE** | Confirmed in `RegisterPage.tsx:50` and ports; attendee cannot cancel or join waitlist. |
| **F-04** | No notification center in navigation | **TRUE** | Confirmed; nav lacks notification bell and inbox popover. |
| **F-05** | Check-in desk is a simulation, not a real tool | **TRUE** | Confirmed in `AdminCheckinPage.tsx`; lack of live camera stream, offline queue, and duplicate debounce. |
| **F-06** | Ticket and OTP trust model undefined on front end | **TRUE** | QR encodes raw text; OTP is client-derived. QR must encode signed token `{v, ticketId, sig}`. |
| **F-07** | "Campus Accreditation & Admission Matrix" on home page | **TRUE** | Confirmed in `HomePage.tsx:186`. Move ticket tiers to Event Detail ticket selector. |
| **F-08** | Hardcoded `.edu` assumption | **TRUE** | Confirmed in `CampusAdmissionPasses.tsx:41`. Parameterize for Indian campuses (`.ac.in`, `.edu.in`). |
| **F-09** | Campus switcher ("Main Campus") in navigation | **TRUE** | Confirmed in `PublicHeader.tsx:27`. Hide unless multiple campuses configured. |
| **F-10** | Missing sharing story (SEO meta tags, `.ics` generation) | **TRUE** | Confirmed; no `react-helmet-async` or `.ics` export on event detail. |
| **F-11** | Certificates claim "cryptographic" verification | **TRUE** | Confirmed in `VerifyCertificatePage.tsx`. Reword to "Verified by EventMesh", embed brand fonts in PDF. |
| **F-12** | Dev tooling (`/dev/accounts`, `/styleguide`) exposed publicly | **TRUE** | Confirmed in `PublicFooter.tsx:46` and `router.tsx:54-58`. Gate behind `VITE_ENABLE_DEV_TOOLS`. |
| **F-13** | Missing system states (404, 403, 500 error boundary, offline banner) | **TRUE** | Minimal 404 exists; no 403, error boundary, or offline banner. |
| **F-14** | Synthesized sounds have no global mute controls | **TRUE** | Confirmed in `src/lib/sound.ts`. Needs `SoundProvider` and Zustand mute toggle. |
| **F-15** | Accessibility gaps in signature features | **TRUE** | Lanyard has no 2D fallback; ticket tear has no keyboard alternative; check-in lacks `aria-live`. |
| **F-16** | CSV export vulnerable to formula injection | **TRUE** | Confirmed in `src/lib/exportCsv.ts:21`. Values starting with `=`, `+`, `-`, `@` not sanitized. |
| **F-17** | Route guards are client-only | **TRUE** | Document in `docs/KNOWN_GAPS.md` that UI guards are UX only. Provide clear 403 page. |
| **F-18** | Ad hoc date & number formatting | **TRUE** | Needs unified `format.ts` using `Intl` for `en-IN`, `Asia/Kolkata`, and ₹ INR. |
| **F-19** | Mock data durability lacks schema version | **TRUE** | Confirmed in `src/api/adapters/mock/index.ts`. Needs unified `schemaVersion` reset. |
| **F-20** | Form builder and FormRenderer parity gap | **TRUE** | `AdminFormBuilder` defines types that `FormRenderer` does not render (`longtext`, `file`, `multiselect`). |
| **S-01** | MUI / Emotion duplicate UI stack | **TRUE** | Confirmed; ready for complete removal. |
| **S-02** | Duplicate motion libraries | **TRUE** | Both `framer-motion` and `motion` installed; standardize on `motion/react`. |
| **S-03** | shadcn setup incomplete | **PARTIAL** | `components.json` present; missing required component additions. |
| **S-04** | Three.js dependencies unclear | **RESOLVED**| `Lanyard.tsx` uses only `three`; no `@react-three/*` packages needed. |
| **S-05** | Missing packages for new features | **TRUE** | Missing `@yudiel/react-qr-scanner`, `ics`, `react-helmet-async`, `recharts`, `react-rough-notation`, `idb-keyval`. |
| **S-06** | Outdated Lucide icons | **TRUE** | Transition to Phosphor via single `Icon.tsx` wrapper. |
| **S-07** | Plus Jakarta Sans generic SaaS face | **TRUE** | Replace with Bricolage Grotesque (800) + Instrument Serif + Geist. |
| **S-08** | Documentation links absolute | **TRUE** | Several docs contain machine-specific absolute links; convert to relative. |
| **P-01** | Dashboard snapshot captured `/dev/accounts` | **TRUE** | Confirmed; timing issue in `ensureAttendeeSession` captured dev switcher instead of lanyard. |
| **P-02** | 56 snapshots bloated inside `src/features/*/snapshots/` | **TRUE** | Move to `docs/snapshots/`. |
| **P-03** | No visual regression or accessibility tests | **TRUE** | Add Playwright visual tests and `@axe-core/playwright`. |
| **P-04** | Missing unit tests for core logic | **TRUE** | Add tests for `format.ts`, `PosterArt` PRNG, CSV sanitizer, ticket state machine. |
| **P-05** | Master summary doc misaligned with admin routes | **TRUE** | Reconcile admin navigation and routes with documentation. |

---

## 5. Gate Outcome

Phase A is complete. All codebase facts, component dependencies, and audit items are verified against active files. Ready to proceed to **Phase B: Cleanup and Installs**.
