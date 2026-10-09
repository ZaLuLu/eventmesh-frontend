# EventMesh Landing Page Implementation Plan — "Champion & Lavender"

> **Version**: 2.0.0  
> **Status**: Approved for Execution  
> **Target**: New Landing Page (`HomePage.tsx`), Shared Foundations, and Component Primitives

---

## 1. Goal and Scope

### 1.1 In-Scope (Goal)
- **New Landing Page (`/` - `HomePage.tsx`)**: Complete rebuild matching the "Champion & Lavender" visual system.
  - **Dynamic Header (64px)**: On-dark state (transparent over `--champion` with light text) while hero is in view, morphing into solid white with `--text` on scroll via `IntersectionObserver`. ⌘K search trigger, city selector, nav links, account menu.
  - **Top Half — "Featured" Carousel**: Height $\ge 50\text{svh}$ (capped at ~520px on desktop), 2-column layout (left: Promoted badge, serif-italic headline, meta, CTAs; right: 28px radius poster). Built on Embla with dot indicators & arrows below content, optional 8s autoplay with visible pause button.
  - **Bottom Half — "New Events" Rail**: Height $\ge 50\text{svh}$, background `--lavender`, text `--champion`. Horizontal snap rail of stacked EventCards (compact 5:4 ratio), desktop hover arrows, touch drag.
  - **The Seam**: Exact straight horizontal seam where the two halves meet (no wave, no diagonal), filling the first viewport on $\ge 1024\text{px}$.
  - **All-Events Discovery Section**: Sticky toolbar under header, category chips, date popover, "Free" toggle, sort select, and segmented Grid/List toggle (synced to URL `?view=grid|list` and `localStorage`). Animated 250ms layout transition with Framer Motion. Cursor-based "Load more" with zero layout jumps.
  - **Footer**: Compact 4-column footer on `--champion`.
- **Shared Foundations & Primitives**:
  - CSS variables for "Champion & Lavender" mapped in `src/index.css` and `tailwind.config.js`.
  - Self-hosted Instrument Serif (regular and italic) + Inter (Variable).
  - Restyled primitives: `Button`, `Badge`, `ToggleGroup`, `Tabs`, `Select`, `Skeleton`, `Sheet`, `Popover`, `Command`.
  - Standardized `EventCard` with 3 variants: **stacked** (default), **overlay**, and **list-row**.
  - Updated `/styleguide` displaying all primitives and variants in both light and dark contexts.
- **Extended Data Layer**:
  - Non-breaking extension of `EventSchema`, `EventsApi` port (`listPromoted`, `listNewest`, `list`), mock seed data with 36+ events, and documentation updates.

### 1.2 Explicit Out-of-Scope List
- **No Redesign of Other Pages**: `/explore`, `/clubs`, `/clubs/:slug`, `/events/:slug`, `/register`, `/calendar`, `/announcements`, `/gallery`, `/verify`, and `/admin/*` remain functional without layout redesign; they only inherit the updated theme tokens.
- **No Visual Slop / Gimmicks**: Strictly NO 3D card tilt, NO neon glow, NO glassmorphism blurs (`backdrop-blur`), NO thick borders, NO stacked shadows, NO arbitrary gradients.
- **No Vendor Hacks**: `src/vendor/ui/coral-dawn.jsx` is not recoloured or hacked. Since it cannot be recoloured cleanly via CSS variables, it is omitted from the landing page.
- **No Font Size Below 13px**: All typography is strictly $\ge 13\text{px}$.

---

## 2. Research Outcome: UI Elements Mapping

| UI Element | Chosen Source / Base | Install Command | Customisation Required |
|---|---|---|---|
| **Carousel Primitive** | shadcn Carousel (`embla-carousel-react`) | `npm i embla-carousel-react` | Custom dot indicators, prev/next pill arrows positioned below content, 8s pauseable autoplay hook, 2-column slide layout. |
| **Grid / List Toggle** | shadcn Toggle Group (`@radix-ui/react-toggle-group`) | `npm i @radix-ui/react-toggle-group` | Pill shape, `--surface` background, `--champion` active background, `--text-2` inactive text, URL query and localStorage synchronization. |
| **Category Tabs** | shadcn Tabs (`@radix-ui/react-tabs`) | `npm i @radix-ui/react-tabs` | Pill sliding chips with active indicator, smooth horizontal scroll for mobile. |
| **Date Popover** | shadcn Popover (`@radix-ui/react-popover`) | `npm i @radix-ui/react-popover` | Popover panel with quick filters (Today, This weekend, This month) and custom date selection. |
| **Sort Dropdown** | shadcn Select (`@radix-ui/react-select`) | `npm i @radix-ui/react-select` | 14px rounded input, `--surface` background, `--line` border, checkmark indicator. |
| **⌘K Command Palette** | shadcn Command (`cmdk`) | `npm i cmdk` | Accessible search dialog with event and club results, group headers, and keyboard navigation. |
| **Mobile Drawer / Sheet** | shadcn Sheet (`@radix-ui/react-dialog`) | `npm i @radix-ui/react-dialog` | Slide-in navigation drawer and mobile filter sheet with body scroll freeze. |
| **EventCard (3 Variants)** | Custom Radix/Tailwind Card | In-house bespoke component | Variant A (stacked), Variant B (overlay), Variant C (list-row). Stretched title link, 4:5 and 5:4 aspect ratios, date chip, verified seal, stats row, pill CTA. |
| **Display Headings** | Instrument Serif | Self-hosted woff2 / Fontsource | Integrated via `@font-face` in `src/index.css` for regular and italic styles. |
| **UI Icons** | Lucide React | Already installed | Sized appropriately (16–20px) with 4px hover nudge on buttons. |
| **Motion Transitions & Layout** | Motion (`motiondivision/motion`) / `framer-motion` | Already installed / `npm i motion` | Staggered text rise (400–600ms), view transition layout animations (`layout` prop), tab sliding indicator, respecting `prefers-reduced-motion`. |
| **Animated Text & Numeric Morphing** | Torph (`torph`) | `npm i torph` | Dependency-free text morphing for results count ("36 events found"), dynamic pricing, ticket counts, and filter counters with place-value physics. |

---

## 3. File and Folder Structure

```
eventmesh-frontend/
├── public/
│   ├── fonts/
│   │   ├── InstrumentSerif-Regular.woff2
│   │   └── InstrumentSerif-Italic.woff2
│   └── images/ (royalty-free local event & club posters)
├── src/
│   ├── api/
│   │   ├── contracts/
│   │   │   └── event.ts (extended with promotion, publishedAt, registrationsCount, club.verified)
│   │   ├── ports/
│   │   │   └── index.ts (extended with listPromoted, listNewest, list)
│   │   └── adapters/
│   │       ├── mock/
│   │       │   ├── mockAdapter.ts (implements listPromoted, listNewest, list)
│   │       │   └── seedData.ts (36+ events, 5 promoted, 9 clubs)
│   │       └── http/
│   │           └── httpAdapter.ts (updated signatures)
│   ├── design-system/
│   │   ├── tokens.ts (Champion & Lavender tokens)
│   │   ├── primitives/
│   │   │   ├── Button.tsx (pill, heights 48/56/40, on-light and on-dark)
│   │   │   ├── Badge.tsx (status pills: Free, Filling fast, Online, Promoted)
│   │   │   ├── ToggleGroup.tsx (grid/list segmented toggle)
│   │   │   ├── Tabs.tsx (category chips)
│   │   │   ├── Popover.tsx (date filter dropdown)
│   │   │   ├── Select.tsx (sort selector)
│   │   │   ├── Skeleton.tsx (EventCard skeleton variants)
│   │   │   ├── Sheet.tsx (mobile navigation drawer)
│   │   │   └── Command.tsx (⌘K search palette)
│   │   └── EventCard/
│   │       ├── EventCard.tsx (variants: stacked, overlay, list-row)
│   │       ├── EventCardSkeleton.tsx
│   │       └── EventCardPoster.tsx (typographic fallback poster)
│   ├── features/
│   │   ├── events/
│   │   │   ├── HomePage.tsx (NEW LANDING PAGE)
│   │   │   └── components/
│   │   │       ├── PromoCarousel.tsx (Top-half Embla carousel)
│   │   │       ├── NewEventsRail.tsx (Bottom-half horizontal card rail)
│   │   │       ├── EventsToolbar.tsx (Sticky filter bar with URL sync)
│   │   │       ├── EventsGrid.tsx (Responsive 1-4 column grid)
│   │   │       ├── EventsList.tsx (Variant C horizontal rows)
│   │   │       └── VerifiedSeal.tsx (Verified club seal icon #1FA34A)
│   │   └── styleguide/
│   │       └── StyleguidePage.tsx (comprehensive token and primitive preview)
│   ├── app/
│   │   ├── PublicHeader.tsx (dynamic on-dark to solid white scroll)
│   │   └── PublicFooter.tsx (compact 4-column footer on --champion)
│   └── index.css (Champion & Lavender CSS variables, font-face rules)
└── docs/
    ├── API_CONTRACT.md (updated with new queries & schema fields)
    ├── COMPONENT_RESEARCH.md (Step 1 findings)
    ├── COMPONENT_SOURCES.md (Step 1 licences)
    ├── IMPLEMENTATION_PLAN.md (this document)
    └── SKILLS_USED.md (Step 0 discovery)
```

---

## 4. API and Contract Changes

### 4.1 Schema Extensions (`src/api/contracts/event.ts`)
```typescript
export const PromotionSchema = z.object({
  label: z.enum(['Promoted', 'Featured']),
  priority: z.number().int().default(1),
  startsAt: z.string(), // ISO string
  endsAt: z.string(),   // ISO string
})

// Event gains:
export const EventSchema = z.object({
  // ... existing fields preserved ...
  promotion: PromotionSchema.optional(),
  publishedAt: z.string().optional(),
  registrationsCount: z.number().int().nonnegative().default(0),
  club: z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    verified: z.boolean().default(false),
  }).optional(),
})
```

### 4.2 Port Additions (`src/api/ports/index.ts`)
```typescript
export interface EventsApi {
  // Existing methods preserved for backward compatibility
  getEvents(filter?: EventsFilter): Promise<PaginatedResult<Event>>
  getEventBySlug(slug: string): Promise<Event | null>
  getEventById(id: string): Promise<Event | null>
  getUpcomingRail(): Promise<Event[]>
  getFeaturedEvents(): Promise<Event[]>
  getSimilarEvents(eventId: string, category: string): Promise<Event[]>
  
  // New Methods for Landing Page
  listPromoted(): Promise<Event[]>
  listNewest(params?: { limit?: number; cursor?: string }): Promise<PaginatedResult<Event>>
  list(params?: {
    category?: string
    date?: string
    free?: boolean
    q?: string
    sort?: 'soonest' | 'newest' | 'popular' | string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Event>>
}
```

---

## 5. Design Tokens and Font Setup

### 5.1 CSS Variables (`src/index.css`)
```css
:root {
  --champion: #151130;
  --champion-2: #1E1846;
  --lavender: #C8BEFA;
  --lavender-100: #F1EEFE;
  --lavender-200: #E4DFFC;
  --lavender-300: #D6CEFB;
  --violet: #5B47D6;
  --violet-hover: #4A38BF;
  --bg: #F7F5FD;
  --surface: #FFFFFF;
  --line: #E3DFF3;
  --text: #151130;
  --text-2: #4B4670;
  --text-3: #6C6790;
  --on-dark: #F3F0FF;
  --on-dark-2: #BDB6E0;
  --success: #1E7A4C;
  --warning: #A85F00;
  --danger: #B42318;
  --verified: #1FA34A;
}
```

### 5.2 Typography Tokens
- **Font Families**:
  - `font-serif`: `'Instrument Serif', Georgia, serif`
  - `font-sans`: `'Inter Variable', 'Inter', -apple-system, sans-serif`
- **Sizes & Clamps**:
  - Promo Title: `clamp(2.5rem, 6vw, 4.5rem)` with line-height `1.02`, font-serif italic.
  - Section Titles: `clamp(1.75rem, 3.5vw, 2.5rem)`, font-serif.
  - Card Title: `18px` to `20px` Inter 600.
  - Body: `16px`.
  - Small: `14px`.
  - Caption: `13px` minimum. **Strictly nothing below 13px.**

### 5.3 Button Rules
- **Pill Shape**: Fully rounded (`rounded-full`).
- **Heights**: 48px default, 56px hero, 40px compact.
- **On-Light**:
  - Primary: Solid `--champion` with white text.
  - Secondary: Solid `--lavender-100` with `--champion` text (hover `--lavender-200`).
  - Tertiary: Text link in `--violet`.
- **On-Dark**:
  - Primary: Solid `--lavender` with `--champion` text.
  - Secondary: Solid `--champion-2` with `--on-dark` text.
- **Hover & Focus**: 150ms color change + 4px icon nudge (NO lift, NO scale). Focus visible: `2px --violet ring` with `2px offset` (on dark: `--lavender`).

---

## 6. Milestones & Progress Checklist

- [x] **M1: Tokens, Fonts, Tailwind Theme, & Radix/shadcn Setup**
  - Install dependencies (`embla-carousel-react`, `@radix-ui/react-toggle-group`, `@radix-ui/react-popover`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, `@radix-ui/react-dialog`, `cmdk`, `torph`, `motion`).
  - Configure self-hosted Instrument Serif and update `tailwind.config.js` and `src/index.css`.
  - *Acceptance*: `npm run build` succeeds, fonts load in browser, CSS tokens defined. (COMPLETED)

- [x] **M2: Restyled Primitives**
  - Build/restyle `Button`, `Badge`, `ToggleGroup`, `Tabs`, `Select`, `Skeleton`, `Sheet`, `Popover`, `Command`.
  - *Acceptance*: All primitives strictly follow pill/flat rules and 44px tap targets. (COMPLETED)

- [ ] **M3: EventCard Variants & /styleguide Page**
  - Build `EventCard` with variants A (stacked), B (overlay), C (list-row), fallback poster, and skeleton.
  - Update `/styleguide` with live previews of all 3 variants and primitives.
  - *Acceptance*: Card title is stretched link; action button sits on top; image scales 1.03 on hover; seal icon displays for verified clubs.

- [ ] **M4: Header/Footer & Hero Promo Carousel (Top Half)**
  - Implement dynamic scroll header (on-dark transparent $\to$ solid white on scroll).
  - Implement top-half 2-column promo carousel with Embla (height $\ge 50\text{svh}$, desktop cap 520px).
  - Controls: prev/next arrows & dots below content, optional 8s autoplay with visible pause button.
  - *Acceptance*: Promoted slides render accurately; keyboard navigable with ArrowLeft/Right; pause button works.

- [ ] **M5: "New Events" Rail (Bottom Half)**
  - Implement bottom half on `--lavender` background with serif title and "See all" link.
  - Horizontally scrolling snap rail of compact 5:4 EventCards (4 visible at 1440px, 1.2 on mobile).
  - Verify horizontal seam between top and bottom halves fills first viewport on desktop ($\ge 1024\text{px}$).
  - *Acceptance*: Touch swipeable on mobile, hover arrows on desktop, seamless meeting at 50/50 seam.

- [ ] **M6: All-Events Section (Toolbar, Grid/List Views, URL Sync, Pagination)**
  - Implement sticky toolbar with search, category tabs, date popover, Free toggle, sort dropdown, and Grid/List toggle.
  - URL query synchronization (`?view=grid|list`, `?q=`, `?category=`, etc.) and `localStorage` view persistence.
  - Animated view switching with Motion (`layout` transitions) and animated text/counter morphing with Torph (`<TextMorph>`).
  - Cursor-based "Load more" button with skeletons and zero layout shift.
  - *Acceptance*: View switching animates smoothly; reloading browser preserves filter and view state; result counts morph smoothly.

- [ ] **M7: Motion, Responsive Pass, & Accessibility (WCAG AA)**
  - Subtle text rise on hero (400–600ms stagger); Motion transitions; Torph place-value numeric rolling; `prefers-reduced-motion` compliance.
  - Responsive audit across 360, 390, phone-landscape, 768, 1024, 1280, 1440, 1920px.
  - WCAG AA contrast check: `--text-2` on `--lavender` and `--on-dark` on `--champion`.
  - *Acceptance*: 0 horizontal page overflow; all touch targets $\ge 44\text{px}$; Lighthouse A11y 95+.

- [ ] **M8: Tests, Layout Audit, Screenshots, & Polish**
  - Unit tests for URL state parsing and card status logic.
  - Component tests for EventCard variants and ToggleGroup.
  - Playwright E2E tests for carousel keyboarding, grid/list reload persistence, URL sync filters, and load-more.
  - Capture automated visual snapshots across all viewports.
  - *Acceptance*: `npm test` and `npm run test:e2e` pass with 0 errors.

---

## 7. Risks and Key Decisions

1. **Coral Dawn WebGL Canvas**: Vendor shader cannot be recoloured to Lavender/Champion cleanly via CSS variables without modifying vendor files. **Decision**: Omit Coral Dawn from the landing page. Use clean, flat solid surfaces with the subtle scrim on overlay cards.
2. **First Viewport 50/50 Seam**: On small laptop screens (e.g. 1366x768), forcing both halves to 50svh could cause text truncation if content is tall. **Decision**: On desktop ($\ge 1024\text{px}$), use `min-h-[50svh]` with a desktop cap of 520px on the hero and flexible content padding. On mobile and tablet, size naturally to content with 32px padding.
3. **Card Stretched Link vs Action Button**: HTML prohibits nested `<a>` or `<button>` inside `<a>`. **Decision**: The card title contains the primary link with an accessible `after:absolute after:inset-0` stretched overlay, while the CTA button is styled as a sibling element with a higher `z-index` and `relative` positioning.

---

## 8. Test Plan

1. **Unit Testing (`vitest`)**:
   - URL filter synchronization: parsing query strings to state and generating shareable URLs.
   - EventCard status derivation: "Filling fast", "Free", "Sold out", "Join waitlist".
   - Verified club seal rendering logic.
2. **Component Testing (`@testing-library/react`)**:
   - `EventCard`: verifies variants A, B, and C render correct DOM hierarchy, images, dates, and badges.
   - `ToggleGroup`: verifies switching triggers callbacks and updates active state.
3. **End-to-End Testing (`playwright`)**:
   - Carousel keyboard interaction (`ArrowLeft` / `ArrowRight` changes slides).
   - Grid/List toggle: clicking list view updates URL to `?view=list`, reloading page maintains list view.
   - Filters: clicking "Workshops" filters events, updates URL query parameter, and reflects correct result count.
   - Load More: clicking button fetches next page of events and appends them without layout jumping.
4. **Visual Layout Verification**:
   - Full automated screenshot audit across 8 viewports: 360px, 390px, phone-landscape (844x390), 768px, 1024px, 1280px, 1440px, and 1920px.
