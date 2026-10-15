# Initial redesign verification

Captured 15 October 2026 against the local Vite mock frontend, not production. These screenshots follow the implementation; `../redesign-audit/` retains the original audit evidence.

- `results.json`: 18 route/viewport checks (Home, Explore, admin × 320/375/414/768/1024/1440), first-use theme/admin alias checks, no page errors, and four axe scans with no returned violations.
- PNGs: full-page Home/Explore/admin at 375 and 1440px, plus saved dark admin at 1440px.
- `lint-baseline.json`: targeted original-source lint checks; see `../REDESIGN_PROGRESS.md` for scope and remaining errors.

Keyboard containment/restoration, saved theme, filter dialog and mobile wallet canvas checks are covered by `tests/e2e/redesign-foundations.spec.ts`. Run that suite with the local server in mock mode; do not run it against production. Complete screen-reader, zoom, live HTTP, role and physical-device verification remains pending.
