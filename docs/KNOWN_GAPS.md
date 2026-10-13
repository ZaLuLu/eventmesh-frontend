# EventMesh v2 — Known Gaps & Backend Requirements

This document captures architectural trade-offs, deliberate client-side constraints, and required backend/edge implementations identified during the EventMesh v2 Campus Funk frontend redesign.

---

### 1. Social Sharing & Link Previews (Audit ID: F-10)
- **Current State**: The frontend uses `react-helmet-async` with a `buildShareMeta(event)` helper to inject Open Graph (`og:title`, `og:description`, `og:image`, `og:type`) and Twitter Card tags dynamically on the client.
- **Limitation**: EventMesh is built as a single-page application (Vite SPA). External social platforms and messaging crawlers (WhatsApp, Telegram, LinkedIn, iMessage, Twitter/X) do not execute client-side JavaScript when scraping link previews.
- **Backend Requirement**: Real social link previews require:
  - An Edge Worker (e.g., Cloudflare Workers / Vercel Edge Middleware) that inspects incoming user agents for bots/crawlers and rewrites the static HTML `<meta>` tags before delivering the payload.
  - Or Server-Side Rendering (SSR) / Server Components (e.g., Next.js App Router).

---

### 2. Certificate Verification & Cryptography (Audit ID: F-11)
- **Current State**: Client-side certificate pages (`/verify/:id`) display verification status, recipient names, issuer details, and the server-returned verification hash. Copy has been updated to "Verified by EventMesh".
- **Limitation**: The browser client cannot compute or validate distributed cryptographic proofs without trusted root public keys and tamper-proof server signatures.
- **Backend Requirement**: Full cryptographic integrity requires server-signed attestations (e.g., ed25519 signatures or verifiable credentials) verified against an authoritative backend API endpoint.

---

### 3. Route Guards & Access Control (Audit ID: F-17)
- **Current State**: Client-side role checks in `AdminShell` and route guards are purely UX conveniences that redirect unauthorized users to the custom 403 Forbidden page (`/forbidden`).
- **Limitation**: Client-side code and state can be inspected or modified by any authenticated student.
- **Backend Requirement**: The backend API must enforce strict Role-Based Access Control (RBAC) on all protected endpoints (`/admin/*`, `/api/registrations`, `/api/events/publish`). No client-side check can replace server authorization.

---

### 4. Ticket Security & QR Payload Verification (Audit ID: F-06)
- **Current State**: Passes display a signed token payload structure `{v, ticketId, sig}` and 6-digit expiring gate OTP slots.
- **Backend Requirement**: Venue gate scanners (`/admin/checkin`) must validate cryptographic HMAC or asymmetric signatures generated exclusively by the EventMesh backend. Bare registration IDs must never be accepted as admission tokens.
