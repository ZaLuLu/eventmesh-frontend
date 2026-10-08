# EventMesh Customisation & Rebranding Guide

EventMesh is architected from the ground up as a **chameleon platform**. It is completely decoupled from any single organization, university, or company. There are **zero hard-coded references** to academic bureaucracy, colleges, or students.

This guide explains how to customize EventMesh for your organization—whether you are a university technical association, a corporate engineering community, an open-source consortium, or a regional creative collective.

---

## 1. Changing Organization Identity & Labels

### 1.1 Organization Profile Seed
In mock mode, the initial organization profile is seeded in:
```
src/api/adapters/mock/seedData.ts
```
To rebrand, simply update the `INITIAL_ORGANIZATION` object:

```typescript
export const INITIAL_ORGANIZATION: Organization = {
  id: 'org-1',
  name: 'Acme Developer Collective',       // Display name
  slug: 'acme-devs',                       // URL slug
  tagline: 'Engineering the Next Frontier',
  description: 'A global network of 9 engineering chapters.',
  logoUrl: '/logos/acme.svg',
  faviconUrl: '/favicon.svg',
  labels: {
    unitSingular: 'Chapter',               // Instead of "Club"
    unitPlural: 'Chapters',               // Instead of "Clubs"
    memberSingular: 'Member',             // Instead of "Student"
    memberPlural: 'Members',
    eventSingular: 'Exhibition',
    eventPlural: 'Exhibitions',
  },
  accentColor: '#1F5F5B',
  contactEmail: 'organizers@acmedevs.com',
}
```

In HTTP mode (`VITE_API_MODE=http`), this information is retrieved dynamically from `GET /api/v1/organizations/:id`.

---

## 2. Managing Clubs / Chapters

### 2.1 Adding or Editing a Club
Clubs are defined in `INITIAL_CLUBS` in `src/api/adapters/mock/seedData.ts`. Each club requires:
- `id`: Unique identifier (e.g., `club-ai`)
- `slug`: Unique URL slug (e.g., `ai-research`)
- `name`: Full title (e.g., `AI Research Society`)
- `shortName`: Display tag (e.g., `AIRS`)
- `category`: Category string
- `themeColor`: **Hex color code** (e.g., `#0091FF`)
- `description`: Markdown club overview

### 2.2 Live Contrast Verification
Every club theme color is processed through EventMesh's **Math Engine** (`src/lib/contrast.ts`):
- It computes the relative luminance:
  $$L = 0.2126 R + 0.7152 G + 0.0722 B$$
- If the contrast ratio between the club's theme color and the background is less than $4.5:1$ (WCAG AA requirement for normal text), the engine automatically selects an inverted high-contrast token (`--ink` vs `--paper`).
- Club administrators can test and verify their color in real-time under **Admin Console → Club Settings**, which displays a live WCAG AA badge indicator.

---

## 3. Typography & Design Tokens

EventMesh uses an **Editorial Exhibition** design language inspired by museum placards, architectural indices, and fine print publishing.

### 3.1 CSS Variables (`src/index.css`)
All visual styling is controlled through CSS variables:
```css
:root {
  /* Universal Foundation */
  --paper: #FAF8F5;          /* Warm museum archival paper */
  --ink: #111111;            /* Deep black carbon ink */
  --ink-60: rgba(17,17,17,0.60);
  --ink-15: rgba(17,17,17,0.15);
  --paper-deep: #F0ECE1;

  /* Signature Accents */
  --premium: #D4AF37;        /* Gold seal for signature events */
  --border-radius: 0px;      /* Strict architectural geometry */

  /* Admin Console System */
  --admin-canvas: #0A0F1D;   /* Dark navy high-density console */
  --admin-sidebar: #0D1527;
  --admin-accent: #1F5F5B;   /* Deep architectural spruce green */
  --admin-border: #1E293B;
}
```

### 3.2 Typography System
Configured in `tailwind.config.js` and loaded in `index.html`:
- **Display Headlines**: `Anton` / `Bebas Neue` (Ultra-bold editorial typography)
- **Body & Prose**: `Instrument Sans` / `Inter` (Precise, legible sans-serif)
- **Metadata & Technical Rows**: `JetBrains Mono` (Zero-ambiguity monospace)

To swap fonts, update the Google Fonts `<link>` in `index.html` and modify `fontFamily` in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    fontFamily: {
      display: ['"Your Display Font"', 'sans-serif'],
      body: ['"Your Body Font"', 'sans-serif'],
      mono: ['"Your Mono Font"', 'monospace'],
    }
  }
}
```

---

## 4. Feature Flags & Config Toggles

In `src/config/features.ts`:
```typescript
export const FEATURES = {
  REQUIRE_APPROVAL_DEFAULT: false,
  ENABLE_CERTIFICATES: true,
  ENABLE_QR_CHECKIN: true,
  ALLOW_EXTERNAL_ATTENDEES: true,
  SHOW_GALLERY: true,
  MAX_UPLOAD_SIZE_MB: 10,
}
```
Flip any flag to disable or enable corresponding tabs and features across public pages and admin console.
