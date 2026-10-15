# Redesign implementation progress

15 October 2026. Scope: `/home/wafiq/coding/eventmesh-frontend` only. The sibling main repository and backend were not modified. No dependencies installed, commits created or deployment performed.

## Initial implementation

This is the first working increment of the approved plan, not completion of every backlog item.

| Area | Implemented | Plan coverage / remaining work |
|---|---|---|
| Theme foundations | Added `tokens.css`, loaded after the existing entry stylesheet; neutral light surfaces, purple accent, semantic statuses, compatible aliases at theme boundaries, readable admin navigation. First visit uses light even on a dark OS; explicit saved dark choice remains. | F01/B01 and B21 foundation. Legacy literal colors and secondary dark surfaces still need route-by-route migration. |
| Type and geometry | Geist aliases, tabular numerals, restrained heading utilities, consistent control/card radii and subtle overlay shadow. Removed unused remote font requests from HTML. | B08/B09 partial. Existing local font imports and literal component styles remain for later cleanup. |
| Public booking | Removed demo identity switching and hardcoded registration submissions from hero, event detail and registration. Users follow the existing registration form. | F02/B02 public shortcuts fixed. Development account tools and authentication flows require their own production guard review. |
| Event presentation | Preserved imported/native kind, provider URL/provenance, currency/timezone and registration state. Missing seats/capacity, identity, contact and price no longer receive invented defaults. Shared `EventLink` handles native routes, external provider URLs and missing links. | F29/F30, B22/B23 partial. Active discovery, calendar links and search use the mapping. Remaining legacy peek/booking components and complete lifecycle parity require follow-up. Server endpoints and capabilities unchanged. |
| Detail and registration | Respect returned registration state; unknown price is unavailable; unavailable capacity has no fabricated progress bar. Registration has a bounded missing/error state and named email field. | F16/F18 partial. Other page error states and full registration state/role matrix remain. |
| Home and Explore | Compact featured carousel with native buttons; filters directly precede results; repeated Home collections removed from the default composition. Tablet Explore uses a dialog and keeps cards readable; desktop header starts at laptop width. | F05–F09 partial, B10/B11 progress. Complete query/filter/pagination parity and 200%/400% zoom remain. |
| Shared accessibility | Modal/Sheet use installed Radix Dialog with title/description, focus containment/return and scroll handling. Mobile admin sidebar uses the same wrapper. Fields/selects use unique IDs and associated descriptions/errors. | F09/F17/F20 addressed for migrated consumers; other custom overlays still require migration. |
| Honest content | Analytics shows returned counts and a real attendance ratio, with error/empty/loading states and an accessible history table. Removed footer health claim, synthetic shelf popularity and invented organization follower counts. Follow and membership language separated. | F03 partial: About and other historical content still need review. |
| Calendar export | Imported event export uses its provider destination; missing end times omit DTEND instead of throwing or inventing a time. | Protects nullable source data in the migrated presentation model. |
| 3D tickets | Existing ticket/3D rendering code retained. Mobile wallet browser check confirms a canvas mounts. | Mandatory feature preserved. This is not verification of all ticket interactions, physical scanning, mobile GPU performance or reduced-motion behavior. |

## Rollout and rollback

- Presentation-only `VITE_ENTERPRISE_DISCOVERY=false` restores the older supplementary recommendation/masonry sections; default is the shorter composition. It does not restore demo registration, fabricated figures or unsafe provider routing.
- Foundation tokens are an additive stylesheet; previous stylesheet and exports remain. Revert the foundation import/Tailwind mappings and the corresponding shell presentation changes together if needed. Do not restore the unreadable forced-dark admin scope in isolation.
- Adapter and accessibility changes are correctness fixes, not presentation flags. Preserve nullable response handling and use reviewable file-level reversions if regressions appear; do not reintroduce synthetic availability or contact information.
- No API, database, ticket-storage or backend migration is required.

## Verification

- TypeScript checking and production build pass.
- Unit suite: 52 tests pass across 16 files, including imported destinations, null availability/pricing, currency, returned registration states, theme preference, repeated field labels, dialog focus containment/return and optional calendar end times.
- Four focused Chromium tests pass: light-first/saved theme, mobile navigation focus, filter dialog/demo shortcut absence, and mobile 3D wallet mounting. Test source: `tests/e2e/redesign-foundations.spec.ts`; run against a local server with `VITE_API_MODE=mock`.
- Final axe checks found zero violations on Home, Explore, admin and analytics with WCAG 2 A/AA, 2.1 AA and 2.2 AA tags. This covers those tested states only.
- Responsive browser checks: Home, Explore and admin at 320, 375, 414, 768, 1024 and 1440px. Root overflow, initial theme and admin alias assertions pass. Browser errors and axe results are recorded in the implementation evidence directory.
- Visual review includes phone Home and desktop Explore/admin. Earlier audit screenshots remain unchanged in `redesign-audit/`; new captures are separated in `redesign-implementation/`.
- Production build warns about the existing export bundle exceeding 600kB. No measured performance improvement or complete WCAG conformance is claimed.
- Test runs emit existing React testing warnings; no assertions are suppressed. Repository-wide lint reports 20 existing errors: six empty catch blocks in the HTTP adapter and 14 issues in untouched micro/command/utility files. Baseline source checks confirmed those code patterns predate this patch; the unused CodeSlots lint directive is likewise untouched. Three pre-existing ThemeToggle empty-catch errors were corrected. See `redesign-implementation/lint-baseline.json`; that stdin baseline omits the full-command unused-disable check, so its CodeSlots row is zero. No new lint error remains.

## Next implementation work

1. Finish lifecycle and data-truth coverage in legacy booking/peek surfaces, authoring defaults and About; test raw HTTP-shaped fixtures beyond the local seeded administrator.
2. Complete query/source/date/city filter and pagination parity, including URL reload/back/forward.
3. Normalize remaining primitive duplication and dialogs, calendar keyboard behavior and roster labels; verify keyboard and screen reader flows at zoom.
4. Implement the wallet's compact profile, viewport-fitting mandatory 3D ticket and accessible actions, with real device performance and QR checks.
5. Migrate the remaining operational screens with scoped permission fixtures, mutation error recovery and visual baselines.

The owner-confirmed general audience, organization diversity, purple branding, light-first presentation, laptop/mobile support and mandatory 3D tickets remain fixed.
