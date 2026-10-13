# Attendee Dashboard & Credential Vault Feature Snapshots

> **Feature Location**: [`src/features/dashboard`](file:///home/wafiq/coding/eventmesh-frontend/src/features/dashboard)  
> **Associated Routes**: `/attendee/dashboard`, `/me`  
> **Capture Standard**: **High Definition (Retina 2x Scale Factor)**  
> **Design Theme**: **Electric Cobalt Blue (`#0047FF`) & Paper White (`#FFFFFF`) Swiss Modernist System**

---

## Overview
High-definition captures of the attendee profile, 3D physics-based student ID lanyard, double-sided boarding passes, and live ticket check-in simulation.

---

## HD Snapshot Catalog

| Snapshot File | Description & State Captured | Resolution |
|---|---|---|
| `01_attendee_dashboard_fullpage_hd.png` | Full-page Attendee Dashboard: Student metadata, summary counters, 3D physics Lanyard ID, and My Tickets grid | **2880 x ~3600 (HD 2x)** |
| `02_attendee_dashboard_overview_hd.png` | Dashboard Hero with student registration bento (Reg No, Degree, Semester) and active metrics | **2880 x 1900 (HD 2x)** |
| `03_student_id_3d_lanyard_credential_hd.png` | Dedicated focus on the interactive Three.js 3D Student ID Badge swinging on realistic fabric woven lanyard with holographic chip and barcode | **1720 x 1560 (HD 2x)** |
| `04_my_tickets_boarding_passes_hd.png` | Double-sided tactile boarding pass cards with departure dates, venues, gate codes, and "Present Pass" actions | **2880 x 1200 (HD 2x)** |
| `05_floating_ticket_modal_intact_hd.png` | Floating modal ticket pass inspection: White heavy cardstock, scannable QR code, gate check-in stub #01, rolling OTP slots | **2880 x 1800 (HD 2x)** |
| `06_floating_ticket_modal_torn_hd.png` | Torn stub state in modal: Severed mechanical perforation, admitted stamp, and confetti feedback | **2880 x 1800 (HD 2x)** |
| `07_dashboard_certificates_tab_hd.png` | Certificates tab: Verified completion credentials with direct PDF download and verification links | **2880 x 1900 (HD 2x)** |
| `08_dashboard_followed_clubs_tab_hd.png` | Followed Clubs tab: Subscribed campus collectives with notification statuses | **2880 x 1900 (HD 2x)** |
| `09_dashboard_mobile_hd.png` | Mobile viewport responsive view of Attendee Dashboard and boarding passes | **780 x 1688 (Mobile 2x)** |

---

## Technical & Design Specifications Verified

1. **Retina HD Rendering**: All snapshots were generated with a `deviceScaleFactor: 2` ensuring pixel-perfect sharpness on Retina/HiDPI displays.
2. **Typography Integrity**: Display typography uses **Plus Jakarta Sans Variable** with tight negative letter tracking (`tracking-[-0.03em]`) and technical numerals rendered in **JetBrains Mono**.
3. **Drafting Canvas Baseline**: Technical hairline borders (`border-line`), corner markers (`+`), and isometric drafting grids are preserved across full-bleed viewports.
4. **State Machine Coverage**: Captures both static default states and interactive runtime states (including active pass selection, gate stub mechanical tear, and modal presentation).
