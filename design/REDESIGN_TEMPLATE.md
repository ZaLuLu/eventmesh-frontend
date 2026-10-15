<!-- Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 -->
# EventMesh Frontend Redesign Template & Technical Audit

**Status:** Canonical Design & Audit Specification, 2026-10-15  
**Domain:** Event Showcase, Discovery, Ticketing & Operations Platform  
**Brand Anchor:** **Royal Purple (`#7C3AED` / `#8B5CF6`) & Midnight Violet**  
**Governing Disciplines:** Hallmark 58 Anti-Slop Gates, `3d-web-experience`, `fixing-motion-performance`, `design-taste-frontend`, `ui-motion`, and `styleseed-design-review`.

---

## 1. Product Brief & Brand Stance

- **Platform Vision:** EventMesh is a premier campus and cultural event showcase platform. It combines rich, poster-led event curation with reliable ticketing, attendee passbook management, and venue check-in operations.
- **Audience:**
  1. *Attendees (Students & Guests):* Discovering compelling events, evaluating dates/lineups, securing passes with two-tap velocity, and presenting scannable tickets at the gate.
  2. *Organizers (Clubs, Societies & Promoters):* Publishing events, curating schedules, ticketing tiers, and managing attendee admission.
  3. *Venue Staff / Gate Volunteers:* Rapid QR admission scanning and attendance tracking with zero friction.
- **Primary Job to Be Done:** Turn event curiosity into confident reservation, verified ticket custody, and seamless door entry.
- **Tone:** Architectural, culturally vibrant, precise, and quietly cinematic. The event artwork and authentic campus energy take center stage; the surrounding interface remains calm, dependable, and tactile.
- **Brand Identity & Color Decision (LOCKED):**
  - **Primary Product Accent:** **Royal Purple** (`#7C3AED` / `oklch(54% 0.28 293)`) in light mode; **Electric Violet** (`#8B5CF6` / `oklch(65% 0.24 293)`) in dark/operations mode.
  - **No Signal Ember Override:** Prior proposals recommending terracotta/ember are strictly superseded. The authentic EventMesh purple palette is preserved and elevated into a unified, high-contrast semantic token system.
  - **Surface Policy:** 100% solid, opaque surfaces. No frosted glassmorphism, no `backdrop-blur-*`, no translucent cards, and no glowing borders. Depth is achieved through crisp 1px hairline rules, elevation steps, and whitespace.

---

## 2. Hallmark Audit: Global Findings & Anti-Pattern Punch List

Conducted in accordance with `hallmark audit`, evaluating the entire EventMesh frontend against the 58 Anti-Slop Gates and the high-agency frontend directives.

### 2.1 Critical Severity (Direct Slop & Performance Failures)

| # | Tell / Anti-Pattern | Location | Root Cause | Required Remediation |
|---|---|---|---|---|
| **C-01** | **Runaway RAF Loop (Infinite GPU Burn)** | `src/design-system/3d/Lanyard.tsx:1311-1312` | Default `breeze = 0.5` causes `current.breeze === 0` to always evaluate to `false`, preventing `resting` from ever becoming `true`. RAF loop runs at 60–120fps forever. | Settle simulation to zero velocity after calm threshold, decouple breeze into passive micro-decay, and stop RAF when calm > 1.2. |
| **C-02** | **Window Pointermove Layout Thrashing** | `src/design-system/micro/TearTicket.tsx:676-687` | Global `pointermove` listener calls `el.getBoundingClientRect()` on every single pixel of mouse movement to compute 3D tilt. Triggers synchronous reflow on every event. | Cache bounding rect on pointer enter / scroll / resize. Use normalized cursor coordinates without reading DOM layout every move. |
| **C-03** | **Concurrent Physics RAF Loops** | `src/design-system/micro/TearTicket.tsx:516-544` | `simulatePaperTear()` launches a manual `requestAnimationFrame(pullStep)` loop while `run()` simultaneously runs `step(now)`. Dual loops mutate simulation state concurrently. | Unify into a single simulation step machine. Eliminate the secondary RAF loop. |
| **C-04** | **Mobile Touch Hijack & Scroll Blocking** | `src/design-system/3d/Lanyard.tsx:1402` & `AttendeeDashboardPage.tsx:376` | `onTouchStart` and `pointerdown` execute `preventDefault()` when touching the canvas, preventing mobile users from scrolling past the badge on mobile dashboards. | Set `touch-action: pan-y` on container. Default mobile to `StudentIDCard2D`, enabling 3D only upon explicit modal or tap interaction. |
| **C-05** | **Carousel Auto-Advance Slop (Gate 33/43)** | `src/features/events/components/CinematicHeroStage.tsx:64-72` | 5-second automatic billboard carousel causes reading disruption, layout jumpiness, and high cognitive load. | Replace auto-advancing single billboard with the **Vertical 60/40 Hero Stage**: Top 60% Cover-Flow Featured Carousel (center active card with side-peeking cards) + Bottom 40% Regular Events Discovery Shelf, putting users in control with smooth spring physics. |
| **C-06** | **Frosted Glass Cliché (Gate 4)** | `CinematicHeroStage.tsx:161, 173, 190` & `PublicHeader.tsx:65` | Widespread `backdrop-blur-md` and `backdrop-blur-xl` over dark/light gradient meshes creates generic "AI template" aesthetic. | Replace all frosted washes with solid opaque `--surface` (`#FFFFFF` light / `#141418` dark) and crisp 1px borders (`--line`). |

### 2.2 Major Severity (Architectural Drift & Coherence Tells)

| # | Tell / Anti-Pattern | Location | Root Cause | Required Remediation |
|---|---|---|---|---|
| **M-01** | **Brand Token Mismatch & Competing Colors** | `design.md` vs `src/index.css` vs `PublicHeader.tsx` | Earlier `design.md` declared Signal Ember (`#E54D2E`); `index.css` declared `--purple: #7C3AED`; Header hardcodes arbitrary `purple-600` classes. | Harmonize all tokens to the single canonical Royal Purple system across light, dark, and admin scopes. |
| **M-02** | **Ad-Hoc Hex Colors in 3D Micro-Components** | `src/design-system/micro/TearTicket.tsx:238-239` | Background hardcoded to `#27272a` and text to `#f5f5f5` rather than consuming theme tokens. | Inject `--card`, `--line`, and `--ink` tokens with dark/light adaptability. |
| **M-03** | **Synthetic Telemetry & Fabricated Metrics (Gate 46)** | `CinematicHeroStage.tsx:204` & `AboutPage.tsx` | Invented strings like `${capacityPct}% Reserved` and synthetic attendee counts. | Render only verified backend values (`remaining_spots`, `is_sold_out`). If unverified, display honest status pill (`Registration Open`). |
| **M-04** | **Dead SVG Code Execution in Render Loop** | `src/design-system/micro/TearTicket.tsx:348-352` | `paint(now)` loops through all bridges to set opacity on non-rendered SVG fibres every frame. | Remove dead fibre code and unused DOM references. |
| **M-05** | **Synchronous Canvas Texture Generation** | `generateStudentIDTexture.ts:28-100` | Synchronously draws two 600x900 2D canvases on main thread every profile mount. | Cache generated textures in memory or generate via OffscreenCanvas / static SVG data URI. |
| **M-06** | **Missing 8-State Interactive Coverage** | `Button.tsx`, `FilterChips`, `EventCard` | Missing explicit `:focus-visible`, `active`, `disabled`, and `loading` states across interactive elements. | Implement full 8-state coverage with tactile micro-physics (`active:scale-[0.98]`). |

### 2.3 Minor Severity (Taste, Typography & Polish Tells)

| # | Tell / Anti-Pattern | Location | Root Cause | Required Remediation |
|---|---|---|---|---|
| **P-01** | **Mixed Corner Radii** | Across `PublicShell`, `EventCard`, `TearTicket` | Components mix `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px), and `rounded-full` unpredictably. | Unify to 3 systemic radii: 8px controls, 14px cards/posters, 9999px status pills only. |
| **P-02** | **Italic Heading Tells (Gate 38a)** | Various headers in `ClubDetailPage.tsx` | Italic words inside display titles. | Display headings strictly roman/upright; use weight or purple accent for emphasis. |
| **P-03** | **Heavy `clip-path: path(...)` GPU Cost** | `TearTicket.tsx:728, 783` | Arbitrary SVG bezier path strings in CSS clip-path animated during 3D perspective tilts. | Simplify perforation geometry to CSS border-radius notches or clean SVG masks. |

**Audit Summary:** `6 Critical · 6 Major · 3 Minor` findings identified across the directory.

### 2.4 Snapshot Audit Punch List (Visual Evidence from 2026-10-15 Snapshots)

Visual inspection of the 18 full-fidelity page snapshots captured on 2026-10-15 (`snapshots-2026-10-15/`) reveals concrete design system violations and UX friction points:

| Snapshot | Page / View | Observable Tells & Visual Anti-Patterns | Required Architectural Fix |
|---|---|---|---|
| `01-home-hero-desktop.png` | Home Hero | Two-tier BookMyShow-style header clutters viewport; auto-advancing banner lacks optical immersion and creates cognitive fatigue; flat carousel fails to convey flagship prestige. | Replace header with studied N1b single-tier solid navbar; replace hero with **Vertical 60/40 Hero Stage** housing the **Liquid Glass Carousel** (`21st.dev/r/componentry/liquid-glass-carousel`) on top with optical refraction and side-peeking cards. |
| `02-home-full-desktop.png` | Home Full | Rigid 4-column event shelf with uniform card heights clips variable aspect ratio posters (4:5, 16:9, square) and feels like an e-commerce template. | Implement **Responsive Masonry Layout** (`21st.dev/r/preetsuthar17/responsive-masonry-layout`) for the 40% campus showcase and directory, allowing posters to breathe at native ratios. |
| `03-explore-desktop.png` | Explore Directory | Generic search bar with plain pill chips; event cards have inconsistent border-radius and lack the studied inset-frame architecture. | Adopt Section 4.3 Inset-Frame Solid Cards (24px outer, 18px inner poster) with split utility dock and tabular metadata. |
| `04-event-detail-desktop.png` | Event Detail | Header image stretches edge-to-edge with arbitrary text overlays; booking button lacks prominent tactile feedback. | Transition to Split Studio macrostructure with framed poster gallery and high-contrast sticky booking dock. |
| `05-ticket-tier-desktop.png` | Ticket Tiers Modal | Inconsistent modal background opacity and unclear fee breakdowns. | Enforce solid opaque modal backdrop with 1px hairline purple border and explicit fee transparency. |
| `06-attendee-dashboard-desktop.png` & `13-dashboard-lanyard-desktop.png` | Attendee Dashboard (ID Card) | **Bento Box Enclosure Anti-Pattern:** The 3D Student ID Card is trapped inside a heavy white bento box card wrapper; info copying is relegated to an external footer row; card initially renders in 2D until clicked. | **Completely eliminate the outer bento box.** Make the 3D ID card **free-floating in open canvas space**. Make **3D native first** on mount. Render registration number in crisp vector typography on the card face and enable **direct on-card copying** via direct tap/click on the badge. |
| `07-attendee-tickets-desktop.png` | Attendee Tickets | Passbook list uses generic grey dividers and lacks perforated ticket tactile feel. | Adopt perforated passbook styling with high-contrast barcode/QR and verified admission status indicators. |
| `08-clubs-directory-desktop.png` & `09-club-detail-desktop.png` | Clubs Directory & Detail | Banner styling conflicts with brand purple; headers contain faux-italic words (Hallmark Gate 38a). | Enforce upright Roman Geist typography; use genuine club badges and verified emerald status marks. |
| `10-announcements-desktop.png` | Announcements | Low-contrast text blocks and generic timeline lines. | Clean editorial timeline with high-contrast ink hierarchy (`#120D24` / `#4E466B`) and category tags. |
| `11-about-desktop.png` | About Page | Synthetic metrics and generic startup copy. | Replace synthetic figures with honest platform stats; add verified partner/sponsor logo proof bar matching BloomFi study. |
| `12-admin-checkin-desktop.png` | Admin Check-in | Dark mode has competing hex values and small tap targets for high-speed door scanning. | Solid Midnight Violet palette (`#0B0814` / `#1A1333`) with full-screen high-visibility admission states and 48px+ touch targets. |
| `14-tearticket-modal-desktop.png` | TearTicket Micro | Hardcoded dark zinc tones (`#27272a`) disconnected from Royal Purple brand token. | Bind ticket theme to `--card`, `--line`, and `--ink` tokens; simplify perforation geometry. |
| `15-home-mobile.png` to `18-event-detail-mobile.png` | Mobile Viewports | Mobile navigation lacks clean slide-down drawer; touch events over 3D canvases block vertical page scrolling. | Apply `touch-action: pan-y`; cap DPR at 1.0; provide solid mobile hamburger drawer with 44px tap targets. |

---

## 3. 3D & Motion Technical Audit & Architecture

Guided by `/3d-web-experience`, `/spline-3d-integration`, and `/fixing-motion-performance`.

### 3.1 TearTicket (`src/design-system/micro/TearTicket.tsx`)

#### Problems Identified
1. **Layout Thrashing:** Mouse tracking calls `rootRef.current.getBoundingClientRect()` inside an unthrottled `window.addEventListener('pointermove')`. Under high polling rate mice (1000Hz), this creates hundreds of layout reflows per second.
2. **Dual Conflicting RAF Loops:** When `simulatePaperTear()` is called, it spawns `pullStep` via `requestAnimationFrame(pullStep)` while `run()` spawns `step` via `requestAnimationFrame(step)`. Both loops update physics springs and position states at the same time, producing jitter.
3. **Clip-Path Performance Penalty:** Ticket body and stub are clipped using `clipPath: path('${geo.body}')`. Browsers cannot hardware-accelerate dynamic path clipping during simultaneous 3D transform animations (`rotateX`, `rotateY`, `perspective`), resulting in subpixel jaggedness and high GPU memory usage.
4. **Theme Incoherence:** The ticket uses hardcoded dark zinc tones (`#27272a`) and lacks the Royal Purple / warm paper palette of EventMesh.

#### Remediation Blueprint
- **Batch Measurements:** Measure ticket rect once on `pointerenter` and listen to `scroll`/`resize` via passive listeners. Calculate normalized tilt strictly from cached offsets.
- **Single Source of RAF Simulation:** Merge `pullStep` into the primary simulation state machine (`phase: 'held' -> 'free' -> 'drop'`). Exactly one RAF loop running at any time.
- **Hardware-Accelerated Cutouts:** Replace heavy SVG `clip-path: path()` with SVG mask or semantic SVG vector boundary with standard rounded rectangle bodies and CSS mask notches.
- **Token Injection:** Bind `--tt-bg` to `var(--card)`, `--tt-ink` to `var(--ink)`, and `--tt-accent` to `var(--accent)`.

### 3.2 Profile 3D Lanyard (`src/design-system/3d/Lanyard.tsx` & `AttendeeDashboardPage.tsx`)

#### Problems Identified
1. **Continuous 100% GPU Utilization:** `breeze = 0.5` causes the animation loop (`tick`) to run perpetually even when the badge is motionless.
2. **Mobile Scroll Hijacking:** Direct touch events call `preventDefault()`, blocking vertical page scroll when attendees drag across the card on smartphones.
3. **Excessive Mobile DPR:** The Three.js renderer uses `devicePixelRatio` up to 2 on mobile devices alongside physical materials, shadow simulation, and cloth physics, leading to thermal throttling.
4. **Desktop/Mobile Ergonomics:** The 3D canvas takes up 5 columns on desktop and 460px height on mobile, forcing critical ticket passes below the fold.

#### Remediation Blueprint
- **Auto-Resting Physics:** Update resting condition to decay `breeze` after 3 seconds of user inactivity. Stop RAF completely when card velocity drops below `0.001`:
  ```ts
  const resting = sim.calm > 0.8 && !sim.grab && velocity < 0.005;
  if (visible && !resting) raf = requestAnimationFrame(tick);
  ```
- **Mobile-First 2D Default:** On viewports `< 768px`, default to `StudentIDCard2D` (0% WebGL overhead). Provide a clean "Inspect in 3D" pill button that opens an isolated 3D modal or enables interactive mode.
- **DPR Capping:** Cap `renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5))`.
- **Non-Blocking Touch:** Add `touch-action: pan-y` and only capture pointer when `pickCard()` registers a direct drag with `hypot(dx, dy) > 10`.

---

## 4. Canonical Design System Tokens (Royal Purple & Midnight Violet)

This is the single source of truth for the entire EventMesh application. All pages and components consume these tokens.

### 4.1 Color Tokens

```css
:root {
  /* Public Canvas & Card Surfaces (100% Solid Opaque) */
  --color-canvas: oklch(98.5% 0.006 290);       /* #FAF8FF - Warm Lavender-Paper Canvas */
  --color-canvas-subtle: oklch(96.5% 0.012 290);/* #F3EDFD - Inset Rows, Secondary Bars */
  --color-surface: oklch(100% 0 0);             /* #FFFFFF - Solid Card Surfaces */
  --color-surface-raised: oklch(99% 0.004 290); /* Raised Modals & Popovers */
  --color-surface-hover: oklch(95% 0.016 290);  /* Interactive Hover Fill */

  /* Ink Scale (High Contrast Plum-Slate) */
  --color-ink: oklch(18% 0.035 290);            /* #120D24 - High-contrast Headlines (16.8:1 AAA) */
  --color-ink-soft: oklch(38% 0.03 290);        /* #4E466B - Subtitles & Body Copy (8.2:1 AAA) */
  --color-ink-muted: oklch(54% 0.025 290);      /* #786F9C - Metadata & Timestamps (4.8:1 AA) */
  --color-ink-faint: oklch(72% 0.02 290);       /* #A59DBF - Inactive Borders & Placeholders */

  /* Crisp 1px Architectural Rules */
  --color-line: oklch(89% 0.025 290);           /* #E9D5FF - Default Hairline Rule */
  --color-line-strong: oklch(78% 0.04 290);      /* #C4B5FD - Interactive Borders / Active Tabs */

  /* Primary Brand Anchor: Royal Purple */
  --color-accent: oklch(54% 0.28 293);          /* #7C3AED - Royal Purple Action & Focus */
  --color-accent-hover: oklch(48% 0.29 293);    /* #6D28D9 - Hover State */
  --color-accent-active: oklch(43% 0.29 293);   /* #5B21B6 - Active Pressed State */
  --color-accent-soft: rgba(124, 58, 237, 0.08);/* Tonal Purple Fill */

  /* Functional Indicators */
  --color-success: oklch(62% 0.17 155);         /* #10B981 - Admitted / Available */
  --color-warning: oklch(72% 0.16 75);          /* #F59E0B - Selling Fast / Pending */
  --color-danger: oklch(58% 0.22 25);           /* #EF4444 - Sold Out / Cancelled */
}

/* Midnight Violet Dark Mode & Operations Scope */
.dark,
.admin-scope,
[data-theme="dark"],
[data-theme="admin"] {
  --color-canvas: oklch(14% 0.025 290);         /* #0B0814 - Midnight Violet Canvas */
  --color-canvas-subtle: oklch(18% 0.03 290);   /* #130E24 - Secondary Operational Rows */
  --color-surface: oklch(21% 0.035 290);        /* #1A1333 - Solid Dark Bento Card */
  --color-surface-raised: oklch(26% 0.04 290);  /* #251B47 - Dropdowns & Flyouts */
  --color-surface-hover: oklch(29% 0.045 290);  /* Interactive Hover Fill */

  --color-ink: oklch(98.5% 0.006 290);          /* #FAF8FF - Pure Text (16.2:1 AAA) */
  --color-ink-soft: oklch(78% 0.04 290);        /* #C4B5FD - Secondary Copy (7.5:1 AAA) */
  --color-ink-muted: oklch(62% 0.035 290);      /* #938BB8 - Captions & Codes (4.6:1 AA) */
  --color-ink-faint: oklch(42% 0.03 290);       /* #5E5680 - Inactive Dividers */

  --color-line: oklch(27% 0.035 290);           /* #2B1F4F - Hairline Rules */
  --color-line-strong: oklch(36% 0.045 290);    /* #402F75 - Focused Inputs */

  /* Electric Violet Accent */
  --color-accent: oklch(65% 0.24 293);          /* #8B5CF6 - Luminous Electric Purple */
  --color-accent-hover: oklch(72% 0.20 293);    /* #A78BFA - High-visibility Hover */
  --color-accent-active: oklch(60% 0.25 293);   /* Active Pressed State */
  --color-accent-soft: rgba(139, 92, 246, 0.14);
}
```

### 4.2 Typography & Spacing System

- **Display Face:** `Geist` (Medium 500 & SemiBold 600) with tracking `-0.025em`. Upright Roman only.
- **Body Face:** `Geist` (Regular 400 & Medium 500) with line-height `1.5` to `1.6`.
- **Data & Numeric Face:** `JetBrains Mono` (`font-mono`, `font-feature-settings: 'tnum' 1`) for ticket serials, timestamps, admission barcodes, and seat quantities.
- **Spacing Scale:** 4px geometric progression: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`.
- **Corner Radii (Calibrated from Reference Study):**
  - `8px` (`rounded-lg`): Form inputs, filter chips, dropdown items.
  - `18px` (`rounded-[18px]`): Inner media/poster framed containers.
  - `24px` (`rounded-[24px]`): Outer event cards, club profile cards, bento panels.
  - `9999px` (`rounded-full`): Status pills, category chips, verification badges, pill CTA buttons (`Follow +`, `Book +`).

---

### 4.3 Studied Card Architecture: The Inset-Frame Solid Card (Hallmark Study DNA)

**Reference Analysis (Attached Image):**
- **Evaluation of 3 Variants:**
  - *Card 1 (Left - SELECTED):* 100% Solid opaque white/paper surface with inset portrait frame, clear typographic hierarchy, inline verification mark, and clean split utility dock. High legibility, zero blur artifacts, tactile and refined.
  - *Cards 2 & 3 (Middle/Right - REJECTED):* Translucent frosted glassmorphism overlays (`backdrop-blur`) and tinted washes over the lower image. Fails Hallmark Gate 4 (frosted glass cliché) and degrades contrast against variable event posters.
- **EventMesh Card Contract (Derived from Card 1):**

```text
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │  ← 24px outer radius, 12px margin
│ │                                                         │ │
│ │                  INSET EVENT POSTER                     │ │  ← 18px inner radius
│ │             (16:9, 4:5, or Square Ratio)               │ │    Overflow-hidden, no bleed
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  Event Title / Organizer Name  [✓ Verified Badge]           │  ← Geist SemiBold 18px + Emerald Check
│  2-line synopsis / date & venue description                 │  ← Geist Regular 13-14px (--color-ink-soft)
│                                                             │
│  ┌───────────────────────────────┐ ┌──────────────────────┐ │
│  │ 📅 Oct 24  👥 312 Registered  │ │      Book +          │ │  ← Split Utility Dock:
│  │ (Tabular JetBrains Mono stats)│ │ (Rounded-full Pill)  │ │    Tabular stats left + Pill action right
│  └───────────────────────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

- **Structural Specifications:**
  - **Outer Container:** Solid `var(--color-surface)` (`#FFFFFF` in light mode, `#1A1333` in dark mode) with `rounded-[24px]`, 1px boundary (`var(--color-line)`), and ambient diffusion shadow (`0 10px 25px -5px rgba(0,0,0,0.04)`).
  - **Inset Media Framing:** 12px top and side margins framing the event poster or club identity. Inner media uses `rounded-[18px]` with `object-cover`. This "gallery frame" creates a physical placard feel rather than an edge-to-edge template banner.
  - **Typography & Status:**
    - Title: Geist SemiBold 18px (`var(--color-ink)`).
    - Verification Badge: Inline emerald badge (`#10B981` / `var(--color-success)`) with clean checkmark directly adjacent to verified organizers and flagship events.
    - Description: Geist Regular 13-14px (`var(--color-ink-soft)`), line-height 1.5, max 2 lines with clean ellipsis clamping.
  - **Bottom Utility Dock:**
    - Left Side: Tabular micro-metadata (Date, Attendees, Price) using line icons and `JetBrains Mono` figures.
    - Right Side: Dedicated pill action button (`rounded-full px-4 py-1.5 text-xs font-medium`), with hover lift and active micro-press feedback (`active:scale-[0.98]`). Available in Subtle Surface (`bg-surface-subtle text-ink hover:bg-accent-soft hover:text-accent`) or Solid Royal Purple (`bg-accent text-white hover:bg-accent-hover`).

---

### 4.4 Studied Navbar & Visual Identity (Hallmark Study: BloomFi Reference)

**Reference Analysis (Attached BloomFi Image by @kate_koma):**

#### 1. Hallmark Study Diagnosis & Schema
```json
{
  "source_mode": "image",
  "source_url": null,
  "source": "public-reference",
  "refusal": "ok",
  "remote_safety": null,
  "macrostructure": "Curated Showcase",
  "macrostructure_alt": "Split Studio",
  "hero": {
    "archetype": "H1-Marquee",
    "knobs": { "alignment": "center", "badge": "icon-sparkle", "media": "3D flora sculptures in lavender meadow", "cta": "solid obsidian pill" }
  },
  "pitch": { "archetype": "F2-Asymmetric-split", "knobs": { "left": "title + pill CTA", "right": "explanatory prose" } },
  "nav": {
    "archetype": "N1b-Canonical-three-section",
    "knobs": { "left": "mark + wordmark", "center": "5 clean links (32px gap)", "right": "dark obsidian pill CTA", "surface": "100% solid opaque" }
  },
  "footer": { "archetype": "Ft1-Minimal", "knobs": { "layout": "clean proof logos row" } },
  "display_role": "soft geometric sans",
  "display_face": null,
  "body_role": "neutral grotesque",
  "body_face": null,
  "label_role": "uppercase grotesque",
  "label_face": null,
  "pairing_logic": "single family (Geist / Plus Jakarta Sans) with tabular numerals (JetBrains Mono)",
  "paper_band": "light >85",
  "paper_value": null,
  "paper_hue": "chromatic-lavender",
  "accent_hue_band": "indigo",
  "accent_value": null,
  "accent_footprint": "recurring 5-15%",
  "density": "medium-generous",
  "asymmetry": "centred-to-asymmetric",
  "treatments": ["solid-opaque-surfaces", "high-radius-cards (24-32px)", "3D-lavender-clay-metallic-sculptures", "zero-glassmorphism"],
  "reveal": "fade-up",
  "motion_library": null,
  "anti_patterns": ["none in reference — strictly avoids frosted glass blur, glowing borders, and noisy gradients"]
}
```

#### 2. Diagnosis Summary & Architecture Translation
- **Visual Palette Translation:**
  - **The Canvas:** Ultra-clean, pale lavender-tinted white canvas (`#FAF8FF` / `oklch(98.5% 0.006 290)`). It gives the page a tactile, editorial feel without muddying image contrast.
  - **The Contrast Engine:** High-contrast Dark Obsidian/Midnight Violet (`#120D24` / `#1A1333`) used for primary pill actions (`Launch BETA` -> `Sign In` / `Book Pass`), dark bento feature panels, and display titles. This grounds the airy lavender field with strong visual authority.
  - **The Brand Tonal Balance:** Soft lavender/violet tints (`#EFEBF7` / `#C4B5FD`) for secondary badges, framed containers, and 3D artwork, tied directly into EventMesh's locked **Royal Purple (`#7C3AED`)** and **Electric Violet (`#8B5CF6`)** accents.
  - **Zero Frosted Glass (Anti-Slop Gate 4):** Both light and dark surfaces are 100% solid and opaque. Depth is conveyed strictly via crisp 1px hairline rules (`var(--color-line)`) and generous whitespace.
- **Typography Translation:**
  - **Headline & Nav Face:** `Geist` (Medium 500 & SemiBold 600) with `-0.025em` tracking. Headings are strictly Roman (no italic words).
  - **Body Copy:** `Geist` Regular 400 (`var(--color-ink-soft)`), line-height 1.5–1.6.
  - **Data Numerals:** `JetBrains Mono` (`font-feature-settings: 'tnum' 1`) for event dates, ticket counts, and timestamps.

#### 3. Studied Navbar Architecture: N1b Canonical Three-Section Navbar
The reference navbar is a masterclass in calm restraint and functional clarity. It directly replaces EventMesh's legacy crowded 2-tier header (`PublicHeader.tsx`).

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [eventmesh]             Explore   Calendar   Clubs   Announcements   About        [ Sign In ]   │
│  (Pure Typographic Logo)          (5 Centered Clean Nav Links)                     (Obsidian)    │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Section Breakdown:**
  1. **Left (Brand Anchor & Logo Decision):**
     - **Logo Policy (LOCKED):** EventMesh currently does not have a finalized graphic logo mark. Until an official logo mark is designed, the brand will strictly use the clean typographic wordmark **`eventmesh`** as its logo.
     - **Typographic Craft:** Rendered in `Geist` Bold/SemiBold, `text-lg tracking-[-0.03em]`, in solid `var(--color-ink)` (`#120D24` light, `#FAF8FF` dark).
     - **Zero Placeholder Slop:** No fake icon badges, no gradient boxes (`bg-gradient-to-tr`), and no split-color text (`Event<span className="text-purple-600">Mesh</span>`). The minimalist typographic mark stands confidently on its own.
  2. **Center (Primary Destinations):**
     - Exactly 5 uncrowded destinations: `Explore` (`/explore`), `Calendar` (`/schedule`), `Clubs` (`/clubs`), `Announcements` (`/announcements`), and `About` (`/about`).
     - Styling: `text-sm font-medium`, `text-ink-soft` transitioning to `text-ink` on hover, separated by 32px gaps.
     - Active link indicated by subtle dot pip or hairline bottom underline, never a garish background pill.
  3. **Right (Action & Profile Dock):**
        - Drawer: Clean slide-down solid sheet displaying the 5 primary destinations in 18px Geist Medium with 1px divider lines.

---

### 4.5 Deconstructing the "Minimal Yet Attractive" Visual Language (BloomFi Hallmark Study)

How does the BloomFi reference achieve a design that feels ultra-minimal, yet immediately captivating and visually luxurious? 

A rigorous Hallmark deconstruction reveals that its elegance does NOT come from decorative clutter, neon glow, or frosted blur tricks. Instead, it relies on a strict **3-Pillar Visual Physics Engine**:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ THE 3-PILLAR "MINIMAL YET ATTRACTIVE" VISUAL FORMULA                                                   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. THE RESTRAINED CANVAS       2. THE SCULPTURAL CENTERPIECE      3. HIGH-CONTRAST OBSIDIAN ANCHORS   │
│ • Pale Lavender Tint (#FAF8FF) • Tactile directional lighting     • Dark Midnight Violet (#120D24)    │
│ • 100% Solid & Opaque          • Heavy physical presence & weight • Pill action buttons & bento tiles │
│ • Zero frosted glass blur      • Chromatic lavender reflections   • Grounds airy paper with authority │
│ • 1px hairline rules only      • Supplies 100% of the visual "wow"• Upright Roman typography (Geist)  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Key Tenets to Replicate in EventMesh:
1. **The Canvas Does Not Compete with the Content:**
   - The background is an ultra-pale chromatic lavender (`#FAF8FF`). It has character, but never screams.
   - All card surfaces are solid white (`#FFFFFF`) or solid dark violet (`#1A1333`). There are **zero translucent washes**, zero `backdrop-blur-*`, and zero neon drop-shadows. The interface feels architectural and calm.
2. **One Dramatic Centerpiece Carries the Visual Drama:**
   - In BloomFi, a single rendered 3D scene (metallic coins emerging from a lavender flower field; a classical Greek temple with violet ambient occlusion) provides all the texture, light, and wonder.
   - For EventMesh, our **3D Native Lanyard Card** and the **Liquid Glass Optical Refraction Carousel** act as this exact tactile centerpiece. Because the surrounding page is clean and restrained, the 3D element pops with immense premium quality.
3. **High-Contrast "Obsidian Pill" Anchor Points:**
   - White/lavender space without dark anchors feels washed out. BloomFi solves this by placing crisp, dark obsidian violet buttons (`Launch BETA`, `Try it now`, `Explore now`) and solid dark feature cards (`Always liquid`, `100% hands-free`) right beside light elements.
   - EventMesh will mirror this: the primary actions (`Sign In`, `Book Pass`, `RSVP +`) and dark mode surfaces use high-contrast Obsidian Violet (`#120D24` / `#1A1333`), delivering strong typographic punch and 16.8:1 AAA contrast.
4. **Monochrome Proof & Upright Typography:**
   - Partner and sponsor logos are rendered in a clean, single-tone monochrome row with generous horizontal tracking.
   - Typography is strictly upright Roman (`Geist` -0.025em tracking). No artificial italic words, no drop-shadow text, no AI gradient words.

---

## 5. Page Redesign Templates & Macrostructures

### 5.1 Home (`/`): The Vertical 60/40 Campus Showcase & Programme

- **Macrostructure:** **Curated Campus Programme with Vertical 60/40 Hero Partition**.
- **Strategic Purpose:** Deliberately splits the initial hero viewport into two synchronized tiers to immediately communicate the high production value and prestige of headline featured events, while simultaneously giving immediate visibility into authentic day-to-day campus events.
- **External Components Integrated:**
  1. **Top 60% Featured Stage:** `LiquidGlassCarousel` (`npx shadcn@latest add "https://21st.dev/r/componentry/liquid-glass-carousel"`).
  2. **Bottom 40% Regular Showcase:** `ResponsiveMasonryLayout` (`npx shadcn@latest add "https://21st.dev/r/preetsuthar17/responsive-masonry-layout"`).

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP 60%: LIQUID GLASS FEATURED CAROUSEL (npx shadcn add .../liquid-glass-carousel)                     │
│ ┌────────────────┐     ┌──────────────────────────────────────────────┐     ┌────────────────┐         │
│ │ PREVIOUS EVENT │     │          ACTIVE FEATURED EVENT               │     │   NEXT EVENT   │         │
│ │ (Peeking card, │ ~~~ │  • Liquid Glass Optical Refraction Lens      │ ~~~ │ (Peeking card, │         │
│ │  scale 0.90,   │     │  • High-Res Framed Artwork                   │     │  scale 0.90,   │         │
│ │  opacity 0.60) │     │  • Title · Date · Venue · Pricing            │     │  opacity 0.60) │         │
│ │                │     │  • [ Book Pass (Royal Purple Pill) ]         │     │                │         │
│ └────────────────┘     └──────────────────────────────────────────────┘     └────────────────┘         │
│                             ◄  [01 / 05] Inertial Drag & Fluid Snap  ►                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ BOTTOM 40%: CAMPUS EVENTS MASONRY SHOWCASE (npx shadcn add .../responsive-masonry-layout)              │
│ "Happening on Campus" (Multi-column adaptive masonry accommodating 4:5, 16:9, & 1:1 native posters)    │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐                    │
│ │ Tall Poster 4:5  │ │ Standard 16:9    │ │ Square 1:1 Badge │ │ Tall Poster 4:5  │                    │
│ │ Design Workshop  │ │ Robotics Arena   │ │ Acoustic Night   │ │ AI Hackathon     │                    │
│ │ Oct 28 · Club ID │ │ Oct 29 · Club ID │ │ Oct 30 · Club ID │ │ Nov 02 · Club ID │                    │
│ │ [ RSVP + Pill ]  │ │ [ RSVP + Pill ]  │ │ [ RSVP + Pill ]  │ │ [ RSVP + Pill ]  │                    │
│ ├──────────────────┤ └──────────────────┘ └──────────────────┘ ├──────────────────┤                    │
│ │ Standard 16:9    │                                           │ Standard 16:9    │                    │
│ │ Tech Symposium   │                                           │ Film Screening   │                    │
│ └──────────────────┘                                           └──────────────────┘                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Component Specifications:
1. **Top 60% — Liquid Glass Carousel (`LiquidGlassCarousel`):**
   - **Source:** `https://21st.dev/r/componentry/liquid-glass-carousel`
   - **Aesthetic & Optical Behavior:** Active featured card is enveloped in a subtle liquid-glass chromatic refraction shader that refracts underlying campus tones upon cursor movement or touch gesture. Neighboring cards peek on left and right margins (`scale-[0.90]`, `opacity-60`), cleanly hinting at upcoming productions.
   - **Physics & Interaction:**
     - Inertial drag with momentum-preserving flick physics.
     - Smooth spring-snapping to the nearest card (`stiffness: 120, damping: 24`).
     - Clicking a peeking side card immediately glides it into the center focus stage.
     - **Anti-Slop Compliance (Gates 33/43):** No unprompted 5-second automatic sliding while the user is reading or inspecting details. A clean progress timeline bar indicates slide order with explicit pause/play controls.
   - **Content Composition:** Inset-framed high-resolution event artwork, category pill, verified club badge, date/time in `JetBrains Mono`, venue, and primary Royal Purple action (`Book Pass`).

2. **Bottom 40% — Campus Events Responsive Masonry (`ResponsiveMasonryLayout`):**
   - **Source:** `https://21st.dev/r/preetsuthar17/responsive-masonry-layout`
   - **Adaptive Geometry:** Eliminates the rigid, clipped 4-column shelf from snapshot `02-home-full-desktop.png`. Instead, renders an organic, responsive multi-column masonry grid (4 columns on desktop `≥1280px`, 3 columns on `1024px`, 2 columns on tablet, 1 column on mobile).
   - **Poster Ratio Freedom:** Supports diverse campus event media formats without letterboxing or awkward stretching:
     - Vertical 4:5 theatre / fest posters
     - Landscape 16:9 tournament / hackathon banners
     - Square 1:1 club profile & speaker showcases
   - **Card Contract:** Every masonry tile is built to the **Section 4.3 Inset-Frame Solid Card** specification (24px outer solid card, 18px inner media container, Geist typography, verified badge, tabular metadata, and `RSVP +` pill).

---

### 5.2 Explore (`/explore`): Fast Discovery Rail

- **Macrostructure:** **Filter & Index**.
- **Layout:** Left sticky filter rail (280px desktop, slide-over drawer on mobile) + responsive event card grid.
- **Event Card Specs (Section 4.3 Inset-Frame Solid Card Architecture):**
  - **Container:** Solid `var(--color-surface)` with `rounded-[24px]` and 1px `var(--color-line)` boundary.
  - **Poster Inset:** 12px margins framing the 16:9 or 4:5 event poster with `rounded-[18px]` inner radius.
  - **Header:** Title in Geist SemiBold 18px + Category pill & verified club badge inline.
  - **Body:** 2-line event description in Geist Regular (`var(--color-ink-soft)`).
  - **Bottom Dock:** Split dock with date & venue in `JetBrains Mono` on the left, and a `Book +` / `View Pass` pill button on the right.
  - **Status:** Honest availability indicator (`Only 14 passes left` or `Sold out`).

---

### 5.3 Event Detail (`/events/:slug`): Split Studio

- **Macrostructure:** **Split Studio**.
- **Left Column:** Full event narrative, schedule breakdown, artist/speaker profiles, venue map, and guidelines.
- **Right Column (Sticky Booking Dock):**
  - Ticket tier selector with pricing, fee transparency, and remaining capacity.
  - Sticky primary reservation action (`Reserve Ticket` / `Join Waitlist`).
  - Add to Google / Apple Calendar shortcut.
  - Share modal and club profile link.

---

### 5.4 Attendee Dashboard (`/attendee/dashboard`): Free-Floating 3D Native ID Card

- **Macrostructure:** **Workbench & Passbook with Free-Floating 3D Identity**.
- **User Instruction & Architectural Directive:**
  > *"the 2d and 3d ID card they are but in a bento box i need the bento box to be gone and the 3d ID card should be free floating on the screen and visibility should be high so the users can copy their related info from the ID not anywhere else and it should be 3d native and 2d later"*

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ATTENDEE DASHBOARD — FREE-FLOATING 3D IDENTITY (ZERO BENTO BOX CAGE)                                   │
├────────────────────────────────────────────────────┬───────────────────────────────────────────────────┤
│ LEFT: ACTIVE PASSES & NEXT UP EVENT                │ RIGHT: FREE-FLOATING 3D STUDENT ID (OPEN CANVAS)   │
│                                                    │                                                   │
│ ┌────────────────────────────────────────────────┐ │      ╭───────╮ (Suspended Lanyard Ribbon & Clip)  │
│ │ ★ NEXT UP EVENT BANNER                         │ │      │   │   │                                    │
│ │ Inter-College AI Hackathon 2026                │ │      │   │   │ Free-Floating in Open Space        │
│ │ Oct 24, 2026 · Hall 4 · Seat B-12              │ │     ┌┴───┴───┐ (Zero enclosing bento box)         │
│ │ [ View Live Ticket / QR Pass ]                 │ │     │EVENTMESH  [ACTIVE PASSHOLDER]              ││
│ └────────────────────────────────────────────────┘ │     │                                            ││
│                                                    │     │  [ Student Photo ]  NAME: ADITYA SHARMA    ││
│ ┌────────────────────────────────────────────────┐ │     │  (Crisp 2x Vector)  REG: ENG-2024-8891  📋 ││
│ │ MY PASSES (Passbook Cards with Tear Stub)      │ │     │                     BRANCH: CS & AI        ││
│ │ • Robotics Championship (Oct 28)               │ │     │  |||||||||||||||||  [Click Card to Copy]   ││
│ │ • Acoustic Night (Oct 30)                      │ │     └────────────────────────────────────────────┘│
│ └────────────────────────────────────────────────┘ │     (3D Native First · Real Physics Drag & Tilt)  │
│                                                    │     [ 3D Active ] [ Switch to Flat 2D View ]      │
└────────────────────────────────────────────────────┴───────────────────────────────────────────────────┘
```

#### Detailed ID Card Architectural Contract:
1. **Complete Elimination of the Bento Box:**
   - **Zero Outer Container:** Remove `<div className="card bento-card p-6 border bg-surface">`.
   - The 3D canvas hangs directly against the dashboard's solid canvas (`var(--color-canvas)` `#FAF8FF` / `#0B0814`).
   - The fabric lanyard ribbon and brushed metallic clasp hang naturally from the top of the canvas, creating genuine physical suspension and depth without a claustrophobic box.
2. **3D Native First Execution:**
   - On page load, the component mounts directly into its **3D Three.js WebGL physics mode** (`Lanyard.tsx`).
   - The 2D card is retained strictly as a secondary view mode (accessible via a clean toggle pill `[3D Native] / [2D Flat Pass]` or automatically fallback-triggered on low-power devices).
3. **High-Visibility Texture & Direct On-Card Copying:**
   - **The Anti-Pattern Solved:** In snapshot `13-dashboard-lanyard-desktop.png`, the user had to read the reg number from an external bottom footer strip (`Copy Reg Number`).
   - **The New Direct On-Card Contract:**
     - The texture generator (`generateStudentIDTexture.ts`) renders registration numbers and attendee identity in ultra-sharp, high-contrast vector typography:
       - Attendee Name: `Geist SemiBold 24px` in solid Obsidian Violet (`#120D24`).
       - Registration / Student ID: `JetBrains Mono Bold 18px` (`#7C3AED` Royal Purple) with an adjacent vector clipboard glyph.
       - Barcode & Validation Pip: Crisp vector lines with 100% black/white optical contrast for direct visual readability.
     - **Direct On-Card Copy Trigger:** Clicking directly on the registration number or badge surface in 3D raycast space copies the registration number directly to the attendee's clipboard.
     - **Tactile Feedback:** An instantaneous, crisp floating toast appears (`✓ Copied ENG-2024-8891 to clipboard`), accompanied by a subtle spring pulse on the 3D card (`scale: 1.03 -> 1.0`).
4. **Physics & Performance Controls:**
   - **Auto-Resting Physics:** Idle decay after 2.5 seconds of stillness reduces GPU utilization to 0fps when untouched.
   - **Non-Blocking Touch:** Uses `touch-action: pan-y` so vertical scrolling on mobile/tablet is never intercepted unless dragging the card itself.

---

### 5.5 Admin Workspace (`/admin`): Operations Console

- **Macrostructure:** **Dense Operations Console**.
- **Palette:** High-efficiency Midnight Violet dark palette (`--color-canvas: #0B0814`).
- **Check-in Console (`/admin/checkin`):**
  - Camera scanner + manual code input.
  - Full-screen high-visibility admission result (Green = Admitted, Amber = Already Checked In, Red = Invalid).
  - Offline sync queue indicator with auto-retry.

---

### 5.6 Public Shell & Header Navigation (`src/app/PublicHeader.tsx`)

- **Macrostructure:** **N1b Canonical Three-Section Solid Header**.
- **Architectural Directive:** Full deprecation of the noisy 2-tier BookMyShow-style header. Replaced with a single-tier 64px (`h-16`) solid navigation bar directly adopting the studied BloomFi DNA.
- **Surface & Shell:**
  - 100% Solid Opaque: `bg-surface` (`#FFFFFF` in light, `#1A1333` in dark) with crisp `border-b border-line`.
  - Zero Frosted Glass: Complete elimination of `bg-paper/95 backdrop-blur-xl` and gradient text classes.
- **Three-Section Composition:**
  - **Left Section (Brand & Logo):**
    - **Pure Typographic Logo:** "eventmesh" wordmark in `Geist` Bold/SemiBold (`text-lg tracking-[-0.03em]`, solid `var(--color-ink)` `#120D24` in light, `#FAF8FF` in dark). No temporary pictorial icon or gradient badge; the clean typography acts as the official brand logo until a permanent asset is finalized.
    - Compact campus switcher dropdown pill directly adjacent.
  - **Center Section (Primary Destinations):**
    - Exactly 5 primary links: `Explore` (`/explore`), `Calendar` (`/schedule`), `Clubs` (`/clubs`), `Announcements` (`/announcements`), and `About` (`/about`).
    - Styled in `text-sm font-medium text-ink-soft hover:text-ink transition-colors` with 32px (`gap-8`) spacing.
    - Active destination highlighted with a subtle indicator dot pip or hairline underline.
  - **Right Section (Action Dock):**
    - Unauthenticated: Dark Obsidian/Midnight Violet pill button (`rounded-full px-5 py-2 text-xs font-semibold bg-ink text-white hover:bg-ink-soft active:scale-[0.98] transition-all`) labeled `Sign In` (`/login`).
    - Authenticated: `My Passes` pill button (`/attendee/dashboard`) with ticket count pill + user avatar menu.
    - Secondary utilities: Theme toggle and notification inbox cleanly integrated.
- **Mobile Responsive Drawer:**
  - `< 768px`: Typographic "eventmesh" logo on the left, Dark Pill CTA + Hamburger button on the right.
  - Tapping hamburger triggers a solid slide-down modal sheet rendering the 5 destinations with generous 44px tap targets and 1px dividers.

---

## 6. Implementation Checklist & Phase Roadmap

| Phase | Core Deliverables | Target Files | Acceptance Criteria |
|---|---|---|---|
| **Phase 1: Token & Theme Foundation** | Implement Royal Purple semantic token system; remove frosted glass styles; unify corner radii; establish solid surface palette. | `src/index.css`, `tailwind.config.js` | Zero competing hex colors; WCAG AA contrast pass across all elements; solid surfaces everywhere. |
| **Phase 2: 3D Physics & Micro-Interaction Optimization** | Refactor `TearTicket.tsx` (batch reads, single RAF loop, CSS mask); optimize `Lanyard.tsx` (auto-resting physics, DPR capping, non-blocking touch). | `src/design-system/micro/TearTicket.tsx`, `src/design-system/3d/Lanyard.tsx` | Zero layout thrashing on mousemove; Lanyard RAF stops completely when resting; 0fps GPU drain when idle. |
| **Phase 3: Public Discovery, N1b Navbar & Vertical 60/40 Hero** | 1. Implement N1b Three-Section Solid Navbar in `PublicHeader.tsx` (single-tier 64px bar, typographic "eventmesh" logo, 5 clean links, dark obsidian pill CTA).<br>2. Add & configure `LiquidGlassCarousel` (`21st.dev/r/componentry/liquid-glass-carousel`) for Top 60% hero featured stage.<br>3. Add & configure `ResponsiveMasonryLayout` (`21st.dev/r/preetsuthar17/responsive-masonry-layout`) for Bottom 40% regular events showcase in `HomePage.tsx`. | `src/app/PublicHeader.tsx`, `CinematicHeroStage.tsx`, `HomePage.tsx`, `ExplorePage.tsx` | Clean 3-section navbar matching BloomFi study; liquid glass refraction lens on active card; responsive masonry accommodating 4:5, 16:9, and 1:1 posters; zero unprovoked auto-advance slop. |
| **Phase 4: Event Detail & Reservation Studio** | Redesign `EventDetailPage.tsx` and registration drawer with Split Studio layout, framed poster gallery, sticky booking dock, and fee transparency. | `EventDetailPage.tsx`, `RegisterPage.tsx` | Clear ticket tier selection; 8-state button states; no layout jumping. |
| **Phase 5: Attendee Dashboard & Free-Floating 3D Identity** | 1. **Remove bento box cage** around Student ID Card.<br>2. Render 3D Lanyard as **free-floating in open canvas space**.<br>3. Make **3D native first** on mount.<br>4. Generate high-visibility 2x vector texture with sharp `JetBrains Mono` registration numbers.<br>5. Implement **direct on-card copy interaction** with toast feedback. | `AttendeeDashboardPage.tsx`, `generateStudentIDTexture.ts`, `Lanyard.tsx` | ID card hangs freely in open space; users can copy info directly from the 3D card; zero external footer row needed; instant ticket passbook access. |
| **Phase 6: Admin Operations Console & Final Verification** | Refactor `/admin` and `/admin/checkin` into dense Midnight Violet operations console; full Playwright snapshot validation. | `AdminCheckinPage.tsx`, `AdminShell.tsx` | High-contrast scanning feedback; 48px+ touch targets; offline sync queue. |

---
*End of Redesign Template & Technical Audit Specification.*


