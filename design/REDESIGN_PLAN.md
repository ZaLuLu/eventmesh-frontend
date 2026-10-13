# EVENTMESH v2: MASTER REDESIGN & HARDENING PLAN
**Thesis**: Transform EventMesh from an engineer-y blueprint layout into an authoritative, tactile "Campus Funk" digital home for collegiate events, combining Luma's 2-tap speed with Stripe Press's typographic craftsmanship and vibrant paper physicality.

---

## 1. Core Mandates & Non-Negotiables
1. **Tickets tear only at venue gate check-in**: Ticket is intact post-registration with QR code on ticket face; tears only when scanned at `/admin/checkin`.
2. **3D Lanyard is an ID badge in profile header**: Sits beside photo, university email, reg number, branch, semester; not a separate pass.
3. **No boxes inside boxes**: Cards exist strictly as standalone tactile objects (tickets, stickers, posters, polaroids).
4. **Paper public, dark admin**: Public is warm paper `#F6F1E7` + ink `#151130` + Cobalt `#0047FF`. Admin is dark `#0F0D1F` + lime `#D4F25A`.
5. **Backend independence**: `VITE_API_MODE=mock|http` remains intact. All new features added via ports with mock implementations.

---

## 2. Component Sourcing Matrix

| Library / Source | Component / Asset | Purpose & Role |
|---|---|---|
| **shadcn/ui** | `button`, `drawer`, `sheet`, `dialog`, `skeleton`, `sonner`, `select`, `input`, `form`, `chart`, `tabs`, `accordion`, `toggle-group` | Rock-solid accessible UI primitives, styled with Campus Funk tokens. |
| **Phosphor Icons** | `@phosphor-icons/react` via `src/design-system/Icon.tsx` | Bold and duotone icons with consistent stroke weight. |
| **Fontsource** | `@fontsource-variable/bricolage-grotesque`, `geist`, `@fontsource/instrument-serif`, `@fontsource/jetbrains-mono` | Display (Bricolage 800), Accent (Instrument Serif Italic), Body (Geist), Mono (JetBrains). |
| **Motion** | `motion/react` | Physics-based spring micro-interactions, layout transitions, exit animations. |
| **Canvas Confetti** | `canvas-confetti` | Dual-cannon celebration bursts on ticket download and admission. |
| **QR Engine** | `@yudiel/react-qr-scanner` & `qrcode` | Gate check-in camera scanner and ticket QR generator. |
| **Calendar Sync** | `ics` | Generating standard `.ics` calendar invitation payloads. |
| **SEO Head** | `react-helmet-async` | Dynamic OpenGraph, Twitter Card, and JSON-LD metadata. |
| **Offline Storage** | `idb-keyval` | IndexedDB offline check-in queue for venue gate kiosks. |
| **Recharts** | `recharts` (via shadcn Chart) | Club-colored telemetry analytics in the admin console. |
| **Rough Notation** | `react-rough-notation` | Hand-drawn marker underlines on key heading words. |

---

## 3. Comprehensive Audit Item Fix Mapping

| Audit ID | Description | Planned Fix Location |
|---|---|---|
| **V-01** | Missing page container on public routes | `src/design-system/layout/PageShell.tsx` |
| **V-02** | Generic placeholder poster artwork | `src/design-system/visuals/PosterArt.tsx` |
| **V-03** | Engineer-speak labels (`01 // EXPLORE`, etc.) | Page-by-page copy refactor (Home, Explore, Calendar, Clubs, Footer) |
| **V-04** | All-caps event titles | Title Case styling across `EventTicketCard`, `EventDetailPage` |
| **V-05** | Footer gimmicks (clock, coordinates, tokens) | `src/app/PublicFooter.tsx` |
| **V-06** | Dead layout gaps on Register and Detail | Balanced CSS Grid `minmax(0,1fr) 380px` in `RegisterPage.tsx`, `EventDetailPage.tsx` |
| **V-07** | Breadcrumb and venue truncation | `EventDetailPage.tsx` |
| **V-08** | Hero blue slab & Explore left filter rail | `HomePage.tsx` (Ticket Stack) & `ExplorePage.tsx` (Sticky Chip Rail) |
| **V-09** | Overlong button labels in persona switcher | `DevAccountsPage.tsx` |
| **V-10** | Monospace typography overused | `tailwind.config.js` & component styling |
| **V-11** | Competing accent colors (Cobalt vs teal) | `src/index.css` (single Lime accent in Admin) |
| **V-12** | Clubs index cards have border box & open dot | `ClubsPage.tsx` (Color-blocked club tiles) |
| **V-13** | Admin check-in simulation buttons & native select | `AdminCheckinPage.tsx` (Mobile-first camera scanner) |
| **V-14** | Fake placeholder seed attendee counts | `src/api/adapters/mock/seedEvents.ts` |
| **F-01** | Register form pre-fills 'Arun Kumar' | `RegisterPage.tsx` (Pre-fill from auth session, lock email) |
| **F-02** | Registration form is 1 long form with weak teammates | `RegisterPage.tsx` (3-step stepper + real team invitations) |
| **F-03** | No waitlist, sold-out, or cancellation flow | `src/api/ports/index.ts`, `src/api/adapters/mock/index.ts`, `RegisterPage.tsx` |
| **F-04** | No notification center in navigation | `src/api/ports/index.ts`, `PublicHeader.tsx`, `NotificationInbox.tsx` |
| **F-05** | Check-in desk is a simulation, not a real tool | `AdminCheckinPage.tsx` (Camera scanner, offline IDB queue) |
| **F-06** | Ticket & OTP trust model undefined | `src/api/ports/index.ts`, `EventAdmissionTicket.tsx`, `AdminCheckinPage.tsx` |
| **F-07** | Admission matrix on home page | Move tiers to `EventDetailPage.tsx`, replace home with compact teaser |
| **F-08** | Hardcoded `.edu` assumption | `src/config/appConfig.ts`, `RegisterPage.tsx` |
| **F-09** | Campus switcher in navigation | `PublicHeader.tsx` (Conditional on multi-campus config) |
| **F-10** | Missing sharing story and .ics calendar | `src/lib/shareMeta.ts`, `src/lib/calendarExport.ts`, `EventDetailPage.tsx` |
| **F-11** | Certificates claim "cryptographic" verification | `VerifyCertificatePage.tsx`, `src/features/certificates/` |
| **F-12** | Dev tooling publicly exposed | `src/app/router.tsx`, `PublicFooter.tsx` (Completed in Phase B) |
| **F-13** | Missing system states (404, 403, error boundary) | `NotFoundPage.tsx`, `ForbiddenPage.tsx`, `ErrorBoundary.tsx`, `OfflineBanner.tsx` |
| **F-14** | Synthesized sounds have no global mute controls | `src/lib/sound.ts`, `src/design-system/SoundProvider.tsx`, `useSoundStore.ts` |
| **F-15** | Accessibility gaps in signature features | 2D Lanyard fallback, visible Tear button, `aria-live` check-in |
| **F-16** | CSV export formula injection vulnerability | `src/lib/exportCsv.ts` |
| **F-17** | Cosmetic route guards | `docs/KNOWN_GAPS.md`, `ForbiddenPage.tsx` |
| **F-18** | Ad hoc date and currency formatting | `src/lib/format.ts` (`Intl` en-IN, Asia/Kolkata, ₹ INR) |
| **F-19** | Mock data durability lacks schema version | `src/api/adapters/mock/index.ts` |
| **F-20** | Form builder and FormRenderer parity gap | `FormRenderer.tsx`, `AdminFormBuilder.tsx` |
| **S-01** | Remove MUI and Emotion | (Completed in Phase B) |
| **S-02** | Consolidate on motion/react | (Completed in Phase B) |
| **S-03** | shadcn setup with design-system aliases | (Completed in Phase B) |
| **S-04** | Three.js dependency audit | (Verified in Phase A & B: pure three.js) |
| **S-05** | Missing packages installed | (Completed in Phase B) |
| **S-06** | Phosphor Icon wrapper | (Completed in Phase B) |
| **S-07** | Replace Plus Jakarta Sans with Bricolage/Geist | `tailwind.config.js`, `src/index.css` |
| **S-08** | Convert absolute doc links to relative | Phase G documentation reconciliation |
| **P-01** | Fix snapshot script for lanyard | `tests/e2e/visual-snapshots.spec.ts` |
| **P-02** | Move 56 snapshots to docs/snapshots | (Completed in Phase B) |
| **P-03** | Playwright visual and axe-core tests | Phase F |
| **P-04** | Unit tests for pure logic | Phase F |
| **P-05** | Master summary doc reconciliation | Phase G |

---

## 4. Phase E Execution Sequence (Step-by-Step)

1. **Step E.1: Tokens, Design System, CSS, & Foundations**
   - Configure Tailwind with Bricolage Grotesque, Instrument Serif, Geist, JetBrains Mono.
   - Update `src/index.css` with CSS custom variables for Paper, Card, Ink, Lavender, Cobalt, and Sticker palette.
   - Build `PageShell.tsx` (V-01).
   - Build `src/lib/format.ts` with `Intl` currency, date, and numbers (F-18).
   - Build `SoundProvider.tsx` and Zustand sound store with global mute (F-14).
   - Build `src/config/appConfig.ts` with campus domains (F-08, F-09).
   - Verify `typecheck && build`.

2. **Step E.2: Primitives & System States**
   - Button (re-skinned with ink fill, cobalt hover, 3px 3px offset shadow).
   - Sticker / Chip primitive with rotation support.
   - `EventTicketCard` with genuine bite notches and price stickers.
   - `PosterArt.tsx` generative seeded SVG engine (V-02).
   - `Marquee.tsx` live data ticker (reduced-motion pause).
   - `PublicHeader.tsx` with notification bell and no single-campus switcher (F-04, F-09).
   - `PublicFooter.tsx` with useful links + giant wordmark (V-05).
   - System states: `NotFoundPage.tsx`, `ForbiddenPage.tsx`, `ErrorBoundary.tsx`, `OfflineBanner.tsx` (F-13).
   - Verify `typecheck && build`.

3. **Step E.3: Landing Page (`/`)**
   - Replace blue slab hero with Promo Ticket Stack (auto-advance 5s, tilt, pause on hover) (V-08).
   - Add live campus marquee ribbon.
   - 3-column `EventTicketCard` grid with snap-scroll on mobile.
   - Color-blocked clubs strip.
   - "How your ticket works" compact 3-state lifecycle teaser (replacing admission matrix) (F-07).
   - Verify `typecheck && build`.

4. **Step E.4: Explore Page (`/explore`)**
   - Wrap in `PageShell`.
   - Replace bulky left filter rail with sticky horizontal chip bar + mobile sheet (V-08).
   - Grid and List toggle with Luma-style dense rows.
   - Skeletons and friendly empty state.
   - Sold out and waitlist states on cards (F-03).
   - Verify `typecheck && build`.

5. **Step E.5: Event Detail (`/events/:slug`) & Register**
   - Detail: PosterArt cover (≤300px desktop), 2-col layout with sticky ticket panel and ticket tier selector (F-07), .ics export, share meta (F-10).
   - Register: 3-step stepper (You [email locked, F-01] -> Team/Details [F-02] -> Confirm).
   - Success screen: Intact ticket with QR on face (Mandate 1).
   - Waitlist and cancellation actions (F-03).
   - Verify `typecheck && build`.

6. **Step E.6: Ticket Lifecycle, Dashboard & 3D Lanyard**
   - `EventAdmissionTicket`: `state` prop (`intact` -> `admitted [torn]`), visible Tear button, `aria-live` announcements (Mandate 1, F-15).
   - `TactileBoardingPass`: restyled to Campus Funk paper tokens.
   - `AttendeeDashboardPage`: profile bento + 3D Lanyard ID badge beside info (Mandate 2), lazy Three.js chunk, 2D fallback (F-15).
   - Verify `typecheck && build`.

7. **Step E.7: Clubs, Calendar, Gallery, Announcements, Certificates**
   - Clubs: 9 vibrant color-blocked tiles (V-12).
   - Calendar: Month grid + day sheet + per-event `.ics` export.
   - Gallery: Polaroid masonry with subtle tilt.
   - Announcements: Mustard sticker banner.
   - Certificates: Brand-matched PDF generator with QR code and `/verify/:id` lookup (F-11).
   - Notifications: In-app inbox popover (F-04).
   - Verify `typecheck && build`.

8. **Step E.8: Admin Console, Check-in Desk & Hardening**
   - Admin palette (`#0F0D1F` + lime `#D4F25A`).
   - Check-in Desk: Mobile-first camera scanner (`@yudiel/react-qr-scanner`), manual OTP fallback, duplicate debounce, offline IndexedDB sync (F-05, V-13).
   - CSV formula injection escaping (F-16).
   - Seed data enrichment (V-14, F-19).
   - Form builder & FormRenderer parity (`longtext`, `file`, `multiselect`) (F-20).
   - Verify `typecheck && build`.

---

## 5. Risk Assessment & Mitigations

1. **Risk: Camera QR Scanner in Headless / Mobile Browsers**:
   - *Mitigation*: Gracefully handle permission denial with an explicit permission-denied UI and prominent manual 6-digit OTP code input fallback.
2. **Risk: Three.js WebGL Performance on Low-End Devices**:
   - *Mitigation*: Cap pixel ratio at `min(window.devicePixelRatio, 2)`, observe with `IntersectionObserver` to halt render loop when off-screen, provide automatic static 2D ID Badge under `prefers-reduced-motion` or mobile.
3. **Risk: Broken Mock State in localStorage Across Updates**:
   - *Mitigation*: Add centralized `schemaVersion` check with auto-reset, plus a "Reset Demo Data" action in development tools (F-19).
