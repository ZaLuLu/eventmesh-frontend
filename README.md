# EventMesh Frontend

> **The Editorial Exhibition Platform for Multi-Club Events**  
> Built for technical associations, engineering collectives, open-source consortiums, and creative guilds.

EventMesh is an editorial-grade web application for event discovery, dynamic multi-field registration, gate check-in, and verifiable credential management across federated clubs.

---

## Key Highlights

- **Museum Exhibition Aesthetic**: Built with the editorial exhibition design system (`--paper` `#FAF8F5`, carbon `--ink` `#111111`, `--premium` `#D4AF37`, and strict `0px` border geometry).
- **Automated WCAG 2.1 Contrast Engine**: Computes relative luminance and guarantees that any club's accent color dynamically selects high-contrast text (`--on-event` with $\ge 4.5:1$ contrast ratio).
- **Strict Boundary**: Zero college bureaucracy. Zero mention of OD (on-duty) requests, attendance letters, or academic gatekeeping anywhere in code, copy, types, or docs.
- **Port-and-Adapter Architecture**: Completely decoupled UI and API. The platform runs standalone out of the box using an in-memory/localStorage mock store with simulated network latency (300–800ms), and flips to a real backend via a single environment variable.
- **Multi-Club RBAC Isolation**: Club Leads and Admins can only view, edit, and export attendees for their own designated club.

---

## Quickstart (Zero Configuration)

### 1. Install & Start Development Server
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

The frontend is pre-configured with `VITE_API_MODE=mock`. It loads 1 organization ("Technical Association"), 9 distinct clubs, 30 realistic events, live registrations, verified certificates, and 6 switchable user personas.

### 2. Instant Persona Switching
Visit **`/dev/accounts`** or click **Dev Personas** in the footer to instantly switch between:
1. **Public Visitor (Anonymous)**
2. **Standard Attendee** (Aarav Sharma)
3. **Gate Volunteer** (Rohan Verma)
4. **DevCraft Club Lead** (Priya Ramanathan) — Scoped exclusively to DevCraft
5. **Association Executive Admin** (Dr. Vikramaditya) — Multi-club oversight
6. **Platform System Administrator** (Root Superuser)

---

## 3-Step Switch to Real HTTP Backend

To connect the frontend to your real backend API, make **zero code changes**:

1. In `.env.local`, set:
   ```env
   VITE_API_MODE=http
   VITE_API_BASE_URL=https://your-api.eventmesh.xyz/v1
   ```
2. Ensure your backend handles CORS for your frontend origin and standard headers (`Authorization`, `Content-Type`, `X-Organization-ID`).
3. Run `npm run dev`. All React Query hooks automatically query `httpAdapter`.

---

## Route Map

### Public Experience
- `/` — Editorial Exhibition Wall, Signature Marquee, 9-Club Grid, Ongoing Feed
- `/explore` — Architectural Index with real-time faceted search (category, club, date, free/paid)
- `/events/:slug` — Exhibition detail page with ticket tiers, schedule, dynamic contrast banner
- `/events/:slug/register` — 3-step registration flow, dynamic form renderer, instant QR pass with confetti
- `/clubs` — 9-Club directory with member counts and signature color chips
- `/clubs/:slug` — Club profile, upcoming calendar, past exhibitions, team leads
- `/calendar` — Chronological agenda view with "Add to Calendar" (.ics export)
- `/announcements` — Association-wide and club broadcasts
- `/gallery` — Archival photo and media wall
- `/verify/:certificateId` — Public cryptographic verification portal
- `/attendee/dashboard` — Personal ticket wallet, QR passes, and downloadable certificates
- `/styleguide` — Live design system primitive showcase

### Admin Console (`/admin`)
- `/admin` — KPI overview, upcoming check-in gates, quick actions
- `/admin/events` — Scoped events table with status tabs, search, and bulk actions
- `/admin/events/new` & `/admin/events/:id/edit` — 6-step Exhibition Wizard with autosave
- `/admin/events/:id/form` — Drag-and-drop registration form builder (`@dnd-kit`)
- `/admin/registrations` — Attendee management, status filter, CSV export
- `/admin/checkin` — Live gate terminal scanner, QR validation, attendee counter
- `/admin/certificates` — Batch certificate generator, preview, and verification tracker
- `/admin/announcements` — Multi-channel broadcast composer
- `/admin/clubs/:id` — Club profile management with live WCAG AA contrast tester
- `/admin/analytics` — Attendance rates, peak check-in curves, club leaderboards
- `/admin/audit` — Immutable chronological audit trail

---

## Available Scripts

- `npm run dev` — Run Vite development server on `localhost:5173`
- `npm run build` — TypeScript typecheck and production Vite build
- `npm run preview` — Preview the production `dist/` build locally
- `npm test` — Run Vitest unit & component test suites
- `npm run test:e2e` — Run Playwright end-to-end integration flows

---

## Documentation Links

- [API Contract Specification](docs/API_CONTRACT.md)
- [OpenAPI 3.0 Specification](docs/openapi.yaml)
- [Customisation & Rebranding Guide](docs/CUSTOMISATION.md)
- [Permissions & RBAC Matrix](docs/PERMISSIONS.md)
