<!-- Hallmark · pre-emit critique: P4 H4 E4 S5 R5 V4. Documentation self-review only. -->
# Design — EventMesh

**Adopted for implementation, 15 October 2026.** House standard for the redesign. Implementation is incremental; this file does not claim every screen implements these rules. It supplements the existing design history; adoption and migration are specified in [docs/REDESIGN_PLAN.md](docs/REDESIGN_PLAN.md). The initial implementation is tracked in [docs/REDESIGN_PROGRESS.md](docs/REDESIGN_PROGRESS.md).

## Product and genre

Aggregated event discovery, first-party hosting, registration, ticket custody and organization operations for a general audience across organization types, on laptops and mobile devices. Modern-minimal, neutral and task-focused. Purple is client-mandated; preserve Geist and real event/organization artwork. Light mode is the first-use default, including admin. Mandatory 3D ticketing is a core product interaction. Backend capabilities and changes are outside this redesign. Product assumptions and unanswered questions live in the plan; do not invent figures, endorsements, admission guarantees or backend capabilities.

## Product context from the main repository

The sibling main repository is read-only context; implementation remains in `eventmesh-frontend`. Preserve the distinction between native events and imported provider events (`../eventmesh/backend/app/modules/events/schemas.py:195–233`). Native events use local detail/registration and issued 3D tickets; imported events use the supplied provider URL, with visible attribution. Do not generate a local admission pass from an external link.

Organization is the general unit; company, community, NGO and institution/club cases are supported in the source model (`../eventmesh/backend/app/modules/organizers/models.py:33–59,79–99`). Keep roles scoped to their organization. Type labels do not grant permissions.

Preserve returned registration state, currency, timezone, nullable capacity and identity. Unknown price is not Free; unknown seats are not an invented count; verification requires evidence. These are frontend mapping rules against existing contracts, not backend changes. Full source evidence and migration acceptance are F29/F30 and B22/B23 in the plan.

## Macrostructure family

- Public discovery: Index First — compact featured event, search/filters and readable results; artwork supports recognition.
- Operations: Workbench — scoped sidebar, page title/actions, filters and tables/forms; scanner prioritizes admission result.
- Organization/content: Long Document — bounded reading width, factual identity/contact, relevant media.
- Wallet: next ticket first, then passes/certificates, compact identity. Mandatory 3D tickets remain first-class on laptop and mobile; metadata/actions appear immediately and the canvas fits available space.

Consistency across these families wins over arbitrary variation. Use repeated rows/cards for equivalent records. Do not create new route structures or rename payload fields for visual reasons.

## Typography

One family: Geist, system-ui, sans-serif. Display/body/accent/legacy mono aliases all use this family; tabular numerals for dates, prices and metrics. Roman headings. Weights 400/500/600. Scale in px/line-height: 12/16 caption, 14/20 UI, 16/24 body, 18/24 subsection, 22/28 section, 28/36 page title, 36/44 maximum public feature. Mobile page title may use 24/32. Inputs on touch use 16px. Never force title truncation to compensate for an undersized layout.

## Theme

Neutral canvas/surfaces, one purple action accent, explicit semantic statuses. Default to light for new users, including admin, even when the operating system prefers dark. Honor existing explicit light/dark preference; dark is secondary. Separate admin layout scope from theme selection. Fix scoped aliases in admin and portal roots before reskinning. Exact color values, light/dark pairs and mechanical old-to-new mappings are in [the token specification](docs/REDESIGN_PLAN.md#design-direction-and-tokens).

Functional image scrims and modal backdrops are permitted; panel surfaces remain opaque. Club identity colors are content, not alternate action colors. Every status includes words; every action retains legible text.

## Space, density and geometry

4px spacing scale; ordinary gaps 8/12/16/24/32. Gutters 16 phone, 24 tablet, 32 desktop. Public container max 1280px; prose 720px; forms 800px. Operational data may fill workspace.

Controls 40px, pointer-dense 32px, coarse-pointer 44px; gate actions 48px. Table rows 44 or 52px. Radii: 4px small utility, 6px control, 8px card, 12px dialog; full radius only for status pills/avatars. One-pixel borders. Cards have no resting shadow; popovers/dialogs may use the specified subtle shadow.

## Component contract

Use existing shadcn/Radix primitives and compatible custom wrappers. Adapt `primitives/Modal` to Dialog, mobile navigation/filter overlays to Sheet; preserve existing consumer props while migrating. Keep native selects for simple choices. Use `asChild` links rather than nested button/anchor markup. Standardize icons through the existing Phosphor facade.

State coverage: default, hover, focus-visible, active, disabled, pending, error and success where meaningful. Form/record result regions can own success/error. Fields have stable unique IDs, associated labels and help/error text, invalid state and preserved input. Controls retain accessible names during pending operations.

Tables expose captions, column headings and explicit named actions. No click-only row as the sole destination. No unlabelled select. User permission and resource scope come from the existing permission/service contract, not visible navigation alone.

## Motion and sound

Preserve meaningful 3D ticket manipulation and ticket-state animation. Do not apply unrelated card tilt, ambient glow, auto-counting numbers or celebration to routine interface actions. Mandatory ticket WebGL is allowed and must be optimized, not removed. Use 100–150ms feedback and up to 180ms overlay transition; instant focus. Animate only necessary opacity/transform, never `transition-all`. Reduced motion uses a stable ticket pose and removes unnecessary spatial motion in JavaScript and CSS; maintain equivalent named DOM actions and a usable QR. WebGL failure gets a static fallback. The normal ticket experience remains 3D without opt-in. Sound/haptic feedback, if retained for scanning, is optional and never the only signal.

## Copy

Use organization-neutral task names: Events, Registrations, Check-in, Tickets, Certificates, Analytics, Settings. General labels are Organization, Organizer, Attendee and Email address; Campus, Club, Student and academic identifiers appear only in the appropriate organization configuration. Preserve existing service validation and payload contracts. Replace “Federation Telemetry”, “Velocity” and “3D Native” with user-facing purpose. Unknown values display unavailable, real zero displays zero. No hardcoded healthy status, fabricated followers or unsupported cryptographic assurance. Preserve real event titles even when long.

## Accessibility and responsive rules

Target WCAG 2.2 AA; automated results do not certify conformance. Keyboard access, visible/unobscured focus, live result announcements, correctly named dialogs, focus entry/containment/return, error associations and non-drag alternatives are mandatory.

Normal text ≥4.5:1, large text ≥3:1; meaningful control/focus boundaries ≥3:1. 44px touch target is the house standard; WCAG AA minimum is 24px with exceptions. Verify at 320/375/414/768/1024/1440px and 200%/400% zoom. Do not hide overflow to conceal layout defects. Data regions may scroll with an accessible label. Header collapse follows available content width; filter rail only when remaining results are readable. Offset sticky content below the 64px header and above mobile safe-area navigation.

## Exports — implementation draft only

Project uses Tailwind 3, so do not paste Tailwind 4 `@theme` into its stylesheet. CSS variables are the runtime source; Tailwind maps existing names to them. These are documentation examples to implement later, not generated source artifacts.

```css
/* Exact OKLCH conversion; precompute absolute channels if relative syntax
   is outside the agreed browser support matrix. Full palette is in the plan. */
:root {
  --color-canvas: oklch(from #F7F8FA l c h);
  --color-surface: oklch(from #FFFFFF l c h);
  --color-ink: oklch(from #17202B l c h);
  --color-accent: oklch(from #7C3AED l c h);
  --color-on-accent: oklch(from #FFFFFF l c h);
  --font-sans: 'Geist', system-ui, sans-serif;
  --radius-control: 6px;
  --radius-card: 8px;
  --radius-dialog: 12px;
  --dur-fast: 100ms;
  --dur-normal: 150ms;
  --dur-overlay: 180ms;
  --z-sticky: 10;
  --z-nav: 20;
  --z-dropdown: 30;
  --z-overlay: 40;
  --z-dialog: 50;
  --z-toast: 60;
}
.dark, [data-theme="dark"] {
  --color-canvas: oklch(from #111318 l c h);
  --color-surface: oklch(from #1D2129 l c h);
  --color-ink: oklch(from #F3F4F6 l c h);
  --color-accent: oklch(from #C4B5FD l c h);
  --color-on-accent: oklch(from #171322 l c h);
}
/* Admin scope no longer forces dark mode. Portals inherit explicit theme.
   Declare ALL compatibility aliases in each token-owning scope.
   Additional aliases are listed in the full plan. */
:root, .dark, [data-theme="dark"] {
  --paper: var(--color-canvas);
  --card: var(--color-surface);
  --ink: var(--color-ink);
  --accent: var(--color-accent);
  --background: var(--color-canvas);
  --foreground: var(--color-ink);
  --primary: var(--color-accent);
  --primary-foreground: var(--color-on-accent);
}
```

Tailwind v3 mapping pattern: `background: 'var(--background)'`, `foreground: 'var(--foreground)'`, `primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)' }`. Use explicit soft-state tokens for opacity fills. Preserve existing `@tailwind`/font imports during migration and verify production-emitted font URLs.

Full standalone `tokens.css`, DTCG and Tailwind v4 exports are deferred: generating unused runtime files or a version migration would exceed this documentation-only task. The plan's palette/type/spacing/elevation tables are the complete value inventory for implementation.

## Required 3D ticket quality

Retain the existing ticket experience on laptop and phone. Reserve a responsive canvas region, expose readable metadata/actions during loading, keep vertical scrolling usable and provide keyboard equivalents to drag/flip/tear operations. Present QR without perspective distortion. Preserve existing admission-state semantics. Pause rendering when hidden/offscreen/settled, reuse/dispose textures, and measure device-appropriate DPR and frame times. A profile lanyard and an admission ticket are distinct: adjust identity spacing without deleting required ticket interaction.

## Do not add

No new UI framework, animation library, marquee, gradient mesh, glass carousel, decorative blob, invented statistics, random aspect ratios, sound on routine theme changes, or marketing hero in the operations console. No new 21st.dev/React Bits intake without source/license, task benefit, measured route cost, accessibility and token review.

## Validation and migration

Follow the plan's phase flags, acceptance criteria and rollback boundaries. Keep existing API schemas, routes, permission checks, QR/CSV/ICS behavior and tests. Preserve user-selected theme/view preferences. Do not announce compliance, performance improvements or a successful registration without evidence.
