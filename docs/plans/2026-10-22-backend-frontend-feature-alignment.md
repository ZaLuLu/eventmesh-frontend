# Backend-to-Frontend Feature Alignment & Full Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all backend capabilities present in the `frontend-integration` branch of EventMesh that are currently missing, mock-only, or unconnected in the frontend, providing a complete, cohesive management and attendee experience.

**Architecture:** Maintain strict adherence to our Hexagonal Architecture: (1) Define typed Zod contracts & TypeScript interfaces in `src/api/contracts/`, (2) Extend port interfaces in `src/api/ports/index.ts`, (3) Implement real HTTP endpoints in `src/api/adapters/http/index.ts` and dev fixtures in `src/api/adapters/mock/index.ts`, (4) Build polished, responsive UI views following the design system tokens and primitives.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide / Phosphor Icons, Radix UI Primitives, TanStack React Query v5, Zod, Vitest.

---

## Phase 1: Platform SuperAdmin Operations Suite

### Task 1: Live Platform-Wide Immutable Audit Trail (`GET /api/v1/admin/audit-logs`)
- **Why:** The backend provides a cryptographically trackable audit log of every role change, payout, and clearance event with actor email, action name, target entity, and JSON metadata. Currently, `AdminAuditPage.tsx` displays static hardcoded mocks.
- **Where:** `src/features/admin/AdminAuditPage.tsx`
- **Files to Modify:**
  - `src/api/contracts/organization.ts`: Add `PlatformAuditLogSchema` and type.
  - `src/api/ports/index.ts`: Update `AuditApi` to accept pagination and entity filter params and return `PlatformAuditLog[]`.
  - `src/api/adapters/http/index.ts`: Wire to `GET /api/v1/admin/audit-logs`.
  - `src/api/adapters/mock/index.ts`: Provide comprehensive mock audit items.
  - `src/features/admin/AdminAuditPage.tsx`: Replace mock call with real query, add entity filter dropdown, pagination, and a metadata viewer.

---

### Task 2: SuperAdmin Master Withdrawal Review & Payout Queue (`GET /admin/withdrawals`, `POST /admin/withdrawals/{id}/review`)
- **Why:** The backend allows SuperAdmins to view all club withdrawal requests across the platform, disburse funds, enter the bank transaction reference (UTR), or reject with a reason (instantly restoring the club's wallet balance). Currently, the frontend only allows club organizers to *request* withdrawals, with no SuperAdmin review console.
- **Where:** `src/features/admin/AdminApprovalsPage.tsx` (New Tab 4: "Withdrawal Disbursements")
- **Files to Modify:**
  - `src/api/contracts/payment.ts`: Add `AdminWithdrawalReviewPayload` (`action`, `reason`, `transfer_reference`).
  - `src/api/ports/index.ts`: Add `adminListWithdrawals` and `adminReviewWithdrawal` to `PayoutsApi`.
  - `src/api/adapters/http/index.ts`: Wire to `GET /api/v1/admin/withdrawals` and `POST /api/v1/admin/withdrawals/{id}/review`.
  - `src/api/adapters/mock/index.ts`: Add mock withdrawals for review.
  - `src/features/admin/AdminApprovalsPage.tsx`: Add Tab 4 with:
    - Status filters (All, Pending, Paid, Rejected).
    - Table displaying Club Name, Requester Email, Bank IFSC & Masked Account, Amount in ₹.
    - "Record Payout" modal: input bank UTR reference code and notes.
    - "Reject" modal: input rejection reason.

---

### Task 3: Master Organization & Club Directory Table (`GET /admin/organizations`)
- **Why:** Platform SuperAdmins need global visibility over every registered organization, collegiate institution, and student club across EventMesh, including total event count, member count, and owner contact details.
- **Where:** `src/features/admin/AdminApprovalsPage.tsx` (New Tab 5: "Platform Directory")
- **Files to Modify:**
  - `src/api/contracts/organization.ts`: Add `PlatformOrganizationItemSchema`.
  - `src/api/ports/index.ts`: Add `getPlatformOrganizations` to `OrganizationsApi`.
  - `src/api/adapters/http/index.ts`: Wire to `GET /api/v1/admin/organizations`.
  - `src/api/adapters/mock/index.ts`: Mock list of platform organizations.
  - `src/features/admin/AdminApprovalsPage.tsx`: Add Directory Tab with search by name/slug, status filters (verified, pending, archived), and stats columns.

---

## Phase 2: Ticketing, Live Fee Breakdown & Attendee Refunds

### Task 4: Dynamic Marketplace Fee Quote Card in Event Creation Wizard (`POST /payments/quote`)
- **Why:** When organizers configure paid tickets in the Event Creation Wizard, they need transparency into the platform fee, Cashfree payment gateway fee, GST, and net take-home earnings per ticket.
- **Where:** `src/features/admin/AdminEventWizardPage.tsx` (Step 3: Tickets & Pricing)
- **Files to Modify:**
  - `src/features/admin/AdminEventWizardPage.tsx`: Add live debounced call to `api.payments.getFeeQuote(ticketPriceInCents)` when `is_free === false`.
  - Display an interactive breakdown card showing:
    - Ticket Price: ₹X
    - Cashfree Gateway Fee (2% + ₹3): -₹Y
    - EventMesh Platform Fee: -₹Z
    - **Estimated Organizer Earnings per Ticket: ₹W**

---

### Task 5: Attendee Ticket Refund Action in Registrations Table (`POST /payments/orders/{order_id}/refund`)
- **Why:** If an attendee requests a refund or an event is rescheduled, organizers and admins need to trigger a full refund directly from the attendee management screen.
- **Where:** `src/features/admin/AdminRegistrationsPage.tsx`
- **Files to Modify:**
  - `src/api/contracts/payment.ts`: Add `RefundOrderPayload` and `RefundOrderResponse`.
  - `src/api/ports/index.ts`: Add `refundOrder` to `PaymentsApi`.
  - `src/api/adapters/http/index.ts`: Wire to `POST /api/v1/payments/orders/{order_id}/refund`.
  - `src/api/adapters/mock/index.ts`: Mock refund response.
  - `src/features/admin/AdminRegistrationsPage.tsx`: Add "Issue Refund" button in the attendee row menu with a confirmation dialog requesting an optional reason.

---

## Phase 3: System Health, Scraper Sync & Gate Upgrades

### Task 6: 23-City Scraper Sync Runner & Health Monitor (`POST /admin/sync`, `GET /admin/sync/runs`)
- **Why:** EventMesh automatically aggregates campus and tech events across 23 cities from Eventbrite, Meetup, and Luma. Platform admins need a way to inspect scraper run history, error messages, and trigger manual syncs on demand.
- **Where:** `src/features/admin/AdminSettingsPage.tsx` (New Tab / Section: "City Aggregator Sync")
- **Files to Modify:**
  - `src/api/contracts/system.ts`: Create `SyncRunSchema` and `SyncReportSchema`.
  - `src/api/ports/index.ts`: Add `runCitySync` and `listSyncRuns` to a new `SyncApi`.
  - `src/api/adapters/http/index.ts`: Wire `POST /api/v1/admin/sync` and `GET /api/v1/admin/sync/runs`.
  - `src/api/adapters/mock/index.ts`: Mock sync history.
  - `src/features/admin/AdminSettingsPage.tsx`: Add an Aggregator card displaying:
    - Last sync timestamp and status badge (SUCCESS / FAILED).
    - Events added, updated, and skipped.
    - "Run City Sync Now" button with loading indicator.

---

### Task 7: Ticket Email Delivery Diagnostic Tool (`POST /admin/email/test`)
- **Why:** Organizers and admins must be able to verify that the SMTP or Resend relay is working properly and tickets are actually arriving in attendee inboxes.
- **Where:** `src/features/admin/AdminSettingsPage.tsx` (Under "System Diagnostics")
- **Files to Modify:**
  - `src/api/contracts/system.ts`: Add `EmailSendReportSchema`.
  - `src/api/ports/index.ts`: Add `testTicketEmail` to `SystemApi`.
  - `src/api/adapters/http/index.ts`: Wire to `POST /api/v1/admin/email/test`.
  - `src/features/admin/AdminSettingsPage.tsx`: Add "Test Email Delivery" card with input for recipient email, a "Dry Run" toggle, and instant health diagnostics.

---

### Task 8: Live Attendance Stats & 1-Click Gate Override (`GET /events/{slug}/attendance-stats`, `POST /events/{slug}/registrations/{id}/toggle-check-in`)
- **Why:** Gate staff at large campus entrances need accurate, multi-door synchronized attendance counts and the ability to manually admit an attendee whose phone died with one click.
- **Where:** `src/features/admin/AdminCheckinPage.tsx`
- **Files to Modify:**
  - `src/api/contracts/event.ts`: Add `EventAttendanceStatsSchema`.
  - `src/api/ports/index.ts`: Add `getAttendanceStats` and `toggleAttendeeCheckIn` to `CheckinApi`.
  - `src/api/adapters/http/index.ts`: Wire to `GET /api/v1/events/{slug}/attendance-stats` and `POST /api/v1/events/{slug}/registrations/{id}/toggle-check-in`.
  - `src/features/admin/AdminCheckinPage.tsx`: Bind attendance progress bar to server stats and add 1-click toggle action in the recent check-ins strip.

---

## Phase 4: User Self-Service & Campus Domain Verification

### Task 9: Self-Service "Become an Organizer" (`POST /users/me/become-organizer`)
- **Why:** Students and community leaders who sign up as attendees should be able to upgrade their accounts to organize events and start clubs without administrative friction.
- **Where:** User profile dropdown & Attendee Dashboard
- **Files to Modify:**
  - `src/api/ports/index.ts`: Ensure `AuthApi.becomeOrganizer` is exposed.
  - `src/api/adapters/http/index.ts`: Wire to `POST /api/v1/users/me/become-organizer`.
  - `src/features/attendee/AttendeeDashboardPage.tsx`: Add a callout banner: "Want to host campus events? Become an Organizer" with a 1-click confirmation dialog.

---

### Task 10: Campus Domain Verification Badge & College Email Linking (`PATCH /users/me`)
- **Why:** Entering a verified university email (e.g. `@mit.edu`, `@iitb.ac.in`) automatically verifies a student's campus credentials on the backend, granting them access to private institution-only events.
- **Where:** Attendee Profile modal / settings
- **Files to Modify:**
  - `src/features/attendee/AttendeeDashboardPage.tsx` / Profile views:
    - Display a "Verified Campus Student" badge with institution name when `institution_verified === true`.
    - Provide a prominent input to link their university email address with real-time feedback on domain verification status.

---

## Verification & Definition of Done
1. **Unit & Integration Tests:** Run `npm test` across all 17 test suites, ensuring all new adapters and contracts pass.
2. **Production Build:** Run `npm run build` (`tsc && vite build`) with zero TypeScript errors and zero bundle warnings.
3. **Repository Parity:** Mirror all files cleanly between `/home/wafiq/coding/eventmesh/frontend` and `/home/wafiq/coding/eventmesh-frontend`.
4. **Git Version Control:** Stage, commit with clear descriptive messages, and push both branches cleanly.
