# EventMesh Design Direction & System Specification Proposal
**Status:** Mandatory Gate-Check (Phase 0 Review)  
**Author:** Principal Frontend Architect & Lead Product Designer  
**Scope:** `eventmesh/frontend` & `eventmesh-frontend`  
**Foundation Standards:** Hallmark (Aesthetic Polish & Baseline Consistency) & Impeccable (Typography & Micro-interaction Rigor)

---

## Executive Summary

EventMesh is transitioning into an **Architectural Collegiate & High-Density Ticketing Platform**. We are preserving our signature brand identity—**Royal Purple (`#7C3AED`) and Electric Violet (`#8B5CF6`) anchored against Obsidian and Porcelain surfaces**—while discarding outdated design artifacts, redundant routing paths, and uncalibrated typography.

This document serves as the mandatory gate-check blueprint for:
1. **Extracted & Locked Color System** with explicit surface roles and contrast ratios.
2. **Aesthetic Direction: Modern Collegiate Editorial**.
3. **Modular Typography Scale** anchored on Plus Jakarta Sans and JetBrains Mono.
4. **Component Anatomy & Elevation Specs** (Cards, Tickets, Badges, Buttons, Spatial Rhythm).
5. **Signature Micro-Interactions** (3D ID Pass Flip, Physics-Based Perforation Tear, Mechanical Desk Date-Stamp).
6. **Route & Trigger Deduplication Plan** for Phase 2.

---

## 1. Extracted Palette & Surface Roles

Our brand identity is locked: **Royal Purple & Electric Violet**. No unauthorized palette substitutions (such as terracotta, ember, or flat slate) are permitted. All colors map to semantic CSS variables with full dark mode and admin console reciprocity.

### 1.1 Color Tokens & Contrast Matrix

| Role | Token Name | Light Mode (Porcelain) | Dark / Admin (Obsidian) | Purpose & WCAG AA Contrast |
| :--- | :--- | :--- | :--- | :--- |
| **Canvas** | `--color-canvas` | `#FAF8FF` | `#0B0814` | Viewport backdrop, immersive depth |
| **Subtle Canvas** | `--color-canvas-subtle` | `#F3EDFD` | `#130E24` | Secondary canvas, sidebar, table header |
| **Surface (Card)** | `--color-surface` | `#FFFFFF` | `#1A1333` | Standard container, modal body, dropdown |
| **Raised Surface** | `--color-surface-raised` | `#FCFAFF` | `#251B47` | Elevated popovers, tooltips, dialogs |
| **Hover Surface** | `--color-surface-hover` | `#F1EBFA` | `#2C2050` | Interactive row/button hover fill |
| **Border / Line** | `--color-line` | `#E9D5FF` | `#2B1F4F` | Hairline separator (1px), subtle card border |
| **Border Strong** | `--color-line-strong` | `#C4B5FD` | `#402F75` | Focus rings, active tabs, prominent dividers |
| **Primary Ink** | `--color-ink` | `#120D24` | `#FAF8FF` | Headings, primary text (14.2:1 contrast) |
| **Secondary Ink** | `--color-ink-soft` | `#4E466B` | `#C4B5FD` | Descriptions, body copy, active icons (7.8:1) |
| **Muted Ink** | `--color-ink-muted` | `#786F9C` | `#938BB8` | Secondary metadata, dates, breadcrumbs (4.9:1) |
| **Faint Ink** | `--color-ink-faint` | `#A59DBF` | `#5E5680` | Placeholder text, disabled glyphs |
| **Brand Accent** | `--color-accent` | `#7C3AED` | `#8B5CF6` | Primary action buttons, badges, links |
| **Accent Hover** | `--color-accent-hover` | `#6D28D9` | `#A78BFA` | Button hover, active link state |
| **Accent Active** | `--color-accent-active` | `#5B21B6` | `#7C3AED` | Button pressed state |
| **Accent Soft** | `--color-accent-soft` | `#F2EAFF` | `#2A1B4A` | Badge background, selected pill chip |
| **Success** | `--color-success` | `#10B981` | `#34D399` | Confirmed status, verified stamp, valid pass |
| **Warning** | `--color-warning` | `#F59E0B` | `#FBBF24` | Low tickets, expiring reservation, pending |
| **Danger** | `--color-danger` | `#EF4444` | `#F87171` | Sold out, cancelled pass, destructive action |

---

## 2. Target Aesthetic & Mood: "Collegiate Modern Editorial"

### 2.1 Aesthetic Statement
EventMesh is designed as a hybrid of a **premier university event exchange** and a **tactile collector's ticketing platform**. It avoids the sterile "flat SaaS template" trap and the illegible "heavy glassmorphism" aesthetic.

- **Crisp Structural Hierarchy:** Hairline 1px borders with calibrated violet undertones (`--color-line`), clean container bounding boxes, and generous internal padding.
- **Physical Keepsake Tactility:** Digital tickets feel tangible through perforated tear stubs, physical stamp ink splats, collegiate badge lanyards, and authentic date wheels.
- **Atmospheric Depth:** In dark mode, ambient radial glows (`filter: blur(80px); opacity: 0.18`) behind hero banners provide depth without washing out text contrast.
- **Zero FOUT & Chrome Stability:** Fixed-height persistent chrome (headers, search bars, filter bars) ensures layout never shifts when content loads.

---

## 3. Modular Typography System

Typography pairs **Plus Jakarta Sans Variable** (geometric clarity, warm open counters) with **JetBrains Mono** (tabular precision for serials, barcodes, dates, and currency).

### 3.1 Type Scale & Hierarchy Specs

| Level | Font Family | Size / Line-Height | Weight | Tracking | Usage & Semantic HTML |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | Plus Jakarta Sans | `36px` / `44px` (`text-4xl`) | 800 (Bold) | `-0.03em` | Hero Showcase Banner (`<h1>`) |
| **Heading 1** | Plus Jakarta Sans | `28px` / `36px` (`text-3xl`) | 700 (Bold) | `-0.025em` | Page Titles, Checkout Header (`<h1>`) |
| **Heading 2** | Plus Jakarta Sans | `22px` / `28px` (`text-2xl`) | 600 (Semibold) | `-0.02em` | Section Titles, Shelf Headers (`<h2>`) |
| **Heading 3** | Plus Jakarta Sans | `18px` / `24px` (`text-lg`) | 600 (Semibold) | `-0.015em` | Card Titles, Modal Headers (`<h3>`) |
| **Subheading** | Plus Jakarta Sans | `14px` / `20px` (`text-sm`) | 600 (Semibold) | `0.04em` | Form labels, navigation tabs (`<label>`) |
| **Kicker / Eyebrow**| Plus Jakarta Sans | `11px` / `16px` (`text-xs`) | 700 (Bold) | `0.20em` | Uppercase category kicker (`<span>`) |
| **Body Base** | Plus Jakarta Sans / Inter | `15px` / `22px` (`text-base`) | 400 (Regular) | `0` | Event descriptions, article paragraphs (`<p>`) |
| **Body Small** | Plus Jakarta Sans / Inter | `13px` / `18px` (`text-sm`) | 400 (Regular) | `0` | Secondary descriptions, hints, table rows |
| **Mono Data** | JetBrains Mono | `12px` / `16px` (`text-xs`) | 500 (Medium) | `0` (`tnum`) | Ticket serials, timestamps, prices (`<code>`) |
| **Micro Caption** | Plus Jakarta Sans | `11px` / `14px` (`text-[11px]`)| 500 (Medium) | `0.02em` | Footnotes, legal disclaimers |

---

## 4. Component Anatomy & Elevation Standards

### 4.1 Canonical Border Radii & Grids
- **Control Radius (`--radius-control` = 8px):** Form inputs, buttons, dropdown triggers, popover menus.
- **Card Radius (`--radius-card` = 14px):** Event cards, modal dialogues, digital passes, attendee roster panels.
- **Pill Radius (`--radius-pill` = 9999px):** Status badges, tag filters, category pills, avatar rings.
- **Base Rhythm:** 4px / 8px grid system. Standard card padding: `16px` (mobile), `24px` (desktop).

### 4.2 Elevation & Shadow Layers
1. **Flat (Level 0):** Canvas and static panels (`border: 1px solid var(--color-line); box-shadow: none;`).
2. **Card Base (Level 1):** `box-shadow: 0 1px 3px rgba(18, 13, 36, 0.04), 0 6px 16px -4px rgba(124, 58, 237, 0.05);`.
3. **Floating / Hover (Level 2):** `box-shadow: 0 4px 12px rgba(18, 13, 36, 0.08), 0 16px 32px -8px rgba(124, 58, 237, 0.12); transform: translateY(-2px);`.
4. **Modal / Overlay (Level 3):** `box-shadow: 0 12px 32px rgba(18, 13, 36, 0.20), 0 32px 64px -12px rgba(124, 58, 237, 0.24); backdrop-filter: blur(8px);`.

### 4.3 8-State Interactive Coverage for Buttons & Controls
Every button, toggle, and input implements all 8 states:
1. **Idle:** Baseline border, solid or ghost background, legible ink.
2. **Hover:** Surface illumination (`bg-accent-hover` or `bg-surface-hover`), elevation lift (`translateY(-1px)`).
3. **Active / Pressed:** Physical press down (`scale(0.98)` or `translateY(1px)`), darker hue (`--color-accent-active`).
4. **Focus-Visible:** Explicit 2px offset outline (`outline: 2px solid var(--color-accent); outline-offset: 2px;`).
5. **Disabled:** Desaturated ink (`--color-ink-faint`), muted background, `cursor: not-allowed`, no hover transform.
6. **Loading:** Disabled interaction, spinner or animated pulse, preserved container width to prevent layout shift.
7. **Success Feedback:** Brief state morph to green confirmation checkmark with spring timing.
8. **Destructive / Error:** Red border and background tint (`--color-danger`), shake animation on rejected submission.

---

## 5. Signature Interactions Concept

### 5.1 Student ID Pass (Tactile 3D Flip)
- **Concept:** Front face features collegiate student credentials, official registration number (`EM-2026-XXXX`), dynamic QR code, and photo avatar.
- **Flip Interaction:** Triggered by card click or dedicated flip button. Utilizes CSS 3D perspective (`perspective: 1200px`) and `transform: rotateY(180deg)` with custom spring easing (`stiffness: 220, damping: 24`).
- **Back Face:** High-security collegiate watermark, magnetic stripe visual, emergency contacts, barcode, and campus department seal.

### 5.2 TearTicket (Physics-Based Gate Perforation)
- **Concept:** Realistic digital representation of a perforated admission ticket.
- **Tear Mechanism:**
  - Procedurally generated scalloped perforation line with bridge connection points.
  - User drags or clicks "Tear Stub". Dynamic bridge fracturing with sound synthesis and micro-rotation.
  - The gate stub separates and drops with simulated gravity (`GRAVITY = 2400`), transitioning the pass status from `unverified` to `admitted/checked-in`.
  - Includes full accessibility fallback: instantaneous keyboard-driven tear toggle (`Enter` / `Space`) and reattach/reset capability for testing.

### 5.3 Mechanical Admission Date-Stamp (Stamp System)
- **Concept:** 3D weighted rubber desk date-stamp for event administrators and ticket verification.
- **Stamp Mechanism:**
  - Date and status wheel selector (`VERIFIED`, `VIP ADMISSION`, `COMPLETED`, `CHECKED-IN`).
  - Pigment selector: Signature Royal Violet, Verification Emerald, or Urgent Amber.
  - Spring-loaded hold-and-release action with mechanical press sound, subtle paper compression bounce (`--spring-snappy`), and authentic imperfect ink edge texture.

---

## 6. Route & Trigger Deduplication Plan (Phase 2 Roadmap)

During reverse engineering, several routing and trigger redundancies were flagged for consolidation:

1. **Attendee Destination Consolidation:**
   - Redundant route aliases (`/dashboard`, `/me`, `/account`) will be cleanly unified under `/attendee/dashboard`.
   - In `PublicHeader.tsx`, duplicate links ("My Passes", "Attendee tickets & passes", "🎓 Attendee") will be consolidated into a single profile/ticket drawer trigger.
2. **Organizer Flow Consolidation:**
   - In navigation, separate links ("Host Events", "Organizer studio & desk", "⚡ Organizer") will be merged into a single clear "Organizer Console" entry point (`/admin`).
3. **Calendar & Schedule Alignment:**
   - `/calendar` and `/schedule` currently display overlapping content. Consolidate into `/explore?view=calendar` with a dedicated calendar view toggle on the discovery showcase.
4. **Dead Link Elimination:**
   - Deprecate `/announcements` and `/stamp` redirect dead-ends in favor of contextual drawers within the event showcase and attendee pass view.

---

## 7. Approval & Next Steps

This document is submitted for mandatory gate-check approval. Upon confirmation:
- **Phase 1:** Purge legacy design documentation (`frontend/DESIGN.md` and `frontend/design/REDESIGN_TEMPLATE.md`).
- **Phase 2:** Execute route and trigger deduplication in router and navigation components.
- **Phase 3:** Implement the high-fidelity UI/UX overhaul across all screens following the specs above.
- **Phase 4:** Re-verify test suites, automated E2E walkthroughs, and production builds.
