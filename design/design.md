# EVENTMESH v2: DESIGN SPECIFICATION ("CAMPUS FUNK")
**System**: Hallmark Custom Theme · Bespoke Depth  
**Target**: `ZaLuLu/eventmesh-frontend`  
**Identity Source DNA**: Bake & Soda, Morncoffee, Ticket Stubs, Rebel Riot, Luma, Stripe Press

---

## 1. Hallmark Theme Declaration

- **Theme Choice**: **Custom ("Campus Funk")**
- **Depth**: Bespoke Depth (Floored by Hallmark 57 Anti-Slop Gates).
- **Core Emotional Intent**: Collegiate energy, physical object permanence, rapid 2-tap RSVP clarity.
- **Reference DNA Synthesis**:
  - **Luma**: High velocity, cover-led event clarity, sticky ticket panel, 2-tap RSVP, instant calendar sync (.ics), density toggle.
  - **Stripe Press**: Typographic authority, physical object materiality, hard edges, zero synthetic blur.
  - **Bake & Soda**: Live dynamic marquee ribbon, taped polaroid memories, tactile note cards.
  - **Morncoffee**: Perforated ticket-stub event cards with cutout notches, price sticker badges, electric cobalt color blocks, zero container nesting.
  - **Ticket Stubs**: Unsevered physical paper pass with QR code printed crisp on ticket face; tears only at venue gate check-in.
  - **Rebel Riot**: Warm paper canvas (`#F6F1E7`), deep ink (`#151130`), punchy Bricolage Grotesque (800) display with 1-word Instrument Serif italic accent, tactile stickers with ±3° rotation.

---

## 2. Color System & Design Tokens

### 2.1 Public Canvas Tokens
| Token | Hex | Role | Contrast vs Paper | Contrast vs Ink |
|---|---|---|:---:|:---:|
| `--paper` | `#F6F1E7` | Canvas background | 1:1 | 16.2:1 |
| `--paper-2` | `#EFE8D9` | Alternate section bands, input fill | 1.1:1 | 15.0:1 |
| `--card` | `#FFFDF8` | Physical ticket cards, posters, polaroids | 1.1:1 | 17.5:1 |
| `--ink` | `#151130` | Headlines, primary button, hairlines, offset shadows | 16.2:1 | 1:1 |
| `--ink-soft` | `#4A4668` | Secondary & metadata text (WCAG AA strict) | 7.1:1 | 2.3:1 |
| `--lavender` | `#C8BEFA` | Soft supporting accent | 1.4:1 | 11.4:1 |
| `--cobalt` | `#0047FF` | Brand anchor, active states, hover lift | 4.8:1 | 3.4:1 |

### 2.2 Sticker Accent Palette
| Sticker | Hex | Application |
|---|---|---|
| `--pink` | `#FF5C8A` | Category chips, PixelForge club tint |
| `--mint` | `#7FD8B8` | Success states, confirmed chips, BIRDS club tint |
| `--mustard` | `#F2B84B` | Marquee band, highlights, Robocrafters club tint |
| `--tangerine` | `#FF6B35` | Urgency tags ("3 seats left"), DevCraft club tint |
| `--sky` | `#8EC5FF` | Informational tags, NexIoT club tint |
| `--lime` | `#D4F25A` | FOSS Society club tint, Admin primary accent |

### 2.3 Club Color Mapping (`src/design-system/clubColors.ts`)
| Club Name | Token | Hex Code |
|---|---|---|
| CP Club | `--cobalt` | `#0047FF` |
| AIONAI | `--lavender` | `#C8BEFA` |
| BIRDS | `--mint` | `#7FD8B8` |
| DevCraft | `--tangerine` | `#FF6B35` |
| Robocrafters | `--mustard` | `#F2B84B` |
| CyberGuard | `--ink` | `#151130` (with `--lime` text) |
| NexIoT | `--sky` | `#8EC5FF` |
| PixelForge | `--pink` | `#FF5C8A` |
| FOSS Society | `--lime` | `#D4F25A` |

### 2.4 Admin Palette (Dedicated Operating Console)
| Token | Hex | Role |
|---|---|---|
| `--admin-bg` | `#0F0D1F` | Deep obsidian studio background |
| `--admin-surface` | `#181530` | Console card and drawer surface |
| `--admin-text` | `#F6F1E7` | High-contrast paper white text |
| `--admin-accent` | `#D4F25A` | Lime primary action buttons & telemetry highlights |
| `--admin-border` | `#2D2852` | Hairline console rules |

---

## 3. Typography Hierarchy & Sizing Rules

```
Display:    Bricolage Grotesque (800), tracking -0.03em, line-height 0.95
Accent:     Instrument Serif (Italic), exactly ONE word per heading
Body & UI:  Geist (16px default, minimum 14px for all metadata), line-height 1.5
Mono:       JetBrains Mono (12px minimum, restricted to serial numbers, OTP slots, token hashes)
```

### Scale
- **Hero Title**: `clamp(3.5rem, 11vw, 10rem)`
- **Page Heading (H1)**: `clamp(2.5rem, 7vw, 6rem)`
- **Section Heading (H2)**: `clamp(2.0rem, 4.5vw, 3.5rem)`
- **Card Title (H3)**: `1.25rem` (20px, font-bold)
- **Body Regular**: `1.0rem` (16px, line-height 1.5)
- **Metadata / Chips**: `0.875rem` (14px, font-medium)
- **Serials & Codes**: `0.75rem` (12px, font-mono font-bold tracking-wider)

### Editorial Rules
- **No All-Caps Headings**: All headings must be Title Case.
- **Instrument Serif Restraint**: Exactly **one** word per major section heading receives the Instrument Serif italic flourish (e.g., "Where Campus *Ideas* Collide").
- **No tiny fonts**: Zero text under 14px except 12px monospace serials and code slots.

---

## 4. Depth, Surface & Object Physicality

- **Zero Blur Shadows**: Blur filters, gaussian glows, and neon backlights are strictly banned.
- **Hard Offset Shadows**:
  - Cards & Tickets: `3px 3px 0 var(--ink)`
  - Buttons (Hover): Lift 2px with `3px 3px 0 var(--ink)`
  - Buttons (Active): Shadow collapses, translate `1px 1px`
- **Zero Nested Boxes (Mandate 3)**:
  - Never place a rounded bordered container inside another rounded bordered container.
  - Sections breathe on paper background; content groups exist as standalone *objects*: a ticket, a poster, a sticker, a polaroid photo.
- **Physical Perforations & Notches**:
  - `EventTicketCard` and `EventAdmissionTicket` feature genuine circular bite notches (`radius 8px`) and dashed hairline perforation rules.
- **Funk Rotation Budget**:
  - Maximum rotation: `±4°`.
  - Permitted only on stickers, ticket stubs, and polaroid cards.
  - Never rotate body text, inputs, or navigational links.
  - Max 1 sticker cluster (2–3 stickers) per viewport.

---

## 5. Page-by-Page Macrostructures

| Route | Page Name | Hallmark Macrostructure | Core Component Architecture |
|---|---|---|---|
| `/` | Landing | `Ticket-Stack & Marquee Ribbon` | Top promo ticket stack (auto-cycle 5s, pause on hover) + live ticker marquee + 3-col EventTicketCard grid + colour-blocked clubs strip + 3-step ticket lifecycle teaser + giant wordmark footer. |
| `/explore` | Explore | `Sticky Chip-Rail & Luma Stream` | Sticky horizontal category/club chip rail + search bar + instant grid/list view toggle + ticket skeleton loading. |
| `/events/:slug` | Event Detail | `Cover Stage & Sticky Checkout Dock` | Generative PosterArt cover (≤300px desktop) + 2-col layout (rich tabs left, sticky ticket tier selector & RSVP right, mobile sticky bottom dock). |
| `/events/:slug/register` | Register | `3-Step Focused Stepper & Order Ledger` | 3-step clean stepper (You [email locked] -> Team/Details -> Confirm) + sticky order summary ledger. |
| `/attendee/dashboard` | Dashboard | `Profile Bento & Physical 3D Lanyard ID Badge` | Student metadata bento + 3D Lanyard ID Badge (lazy Three.js with 2D static fallback) + double-sided boarding passes + certificate vault. |
| `/clubs` | Clubs Index | `Vibrant Color-Blocked Tiles` | 9 bold club tiles with club background tints, large display titles, 2-line clamped summary, member count sticker, bell follow toggle. |
| `/calendar` | Calendar | `Academic Matrix & Day Sheet` | Month grid with club color dot markers, day inspection sheet, per-event `.ics` download. |
| `/admin` | Admin Console | `Command Studio & Density Grid` | Dark obsidian stage (`#0F0D1F`), lime accents (`#D4F25A`), club-tinted Recharts analytics, 4 clear sidebar groups. |
| `/admin/checkin` | Check-in Desk | `Mobile-First Camera Terminal & Haptic Kiosk` | Live mobile camera QR scanner (`@yudiel/react-qr-scanner`), manual OTP code fallback, instant result cards, duplicate debounce (3s), offline IndexedDB sync. |
| `/verify/:id` | Certificate Verify | `Verified Seal & Hash Ledger` | Single credential code lookup, server hash status badge, official verification stamp. |

---

## 6. What We Reject (Anti-Slop Hard Gates)

1. **No Gradients**: Except the optional soft Coral Dawn backdrop in landing hero.
2. **No Sci-Fi / Cyberpunk Glow**: No neon cyan/magenta borders, no pulse shadows.
3. **No Blueprint / Technical Drawing Leftovers**: No drafting grids, no `+` crosshairs, no `// 01 //` dividers.
4. **No Jargon / Corporate Pitch-Speak**: Banned: *dossier, run-of-show, accreditation matrix, proceedings, autonomous collectives*.
5. **No Smooth-Scroll Hijacking**: Native scroll only; no Lenis or scroll-jacking.
6. **No Fake Metrics or Placeholders**: Believable attendee numbers, genuine Indian campus context (`.ac.in`, `.edu.in`, ₹ INR).
