---
name: ui-ux-design
description: >-
  Expert UI/UX design guidance for consumer entertainment, live event ticketing,
  and discovery platforms (inspired by Netflix, BookMyShow, Zomato District, Luma, and Dice).
  Use when designing or refining layouts, carousels, hero billboards, cards, micro-interactions,
  color palettes, and high-conversion ticketing flows.
---

# UI/UX Design System & Entertainment Experience Guide

This skill provides design patterns, heuristics, and components for building world-class discovery and booking experiences comparable to **BookMyShow**, **Netflix**, and **District (Zomato District / Luma / Dice)**.

---

## 1. Core Visual Principles & Atmospheric Depth

### 1.1 The Entertainment Canvas (Dark & Hybrid Modes)
- **Cinematic Canvas**: Deep rich dark backgrounds (`#0B0C10`, `#0F1117`, `#14161F`) that make high-resolution event artwork, video teasers, and vibrant badge colors pop.
- **Ambient Glow & Backlighting (Netflix / Apple TV pattern)**:
  - Behind hero billboards and featured cards, cast a blurred radial gradient (`filter: blur(80px); opacity: 0.35`) sampling the artwork's dominant color.
- **Glassmorphism & Layering**:
  - Translucent navigation bars (`backdrop-blur-md bg-black/60 border-b border-white/10`).
  - Floating pill tags and badges (`backdrop-blur-sm bg-white/10 text-white border border-white/15`).

### 1.2 Color & Status Tokens
- **Vibrant Energy Accents**: Electric Crimson (`#E50914` / `#FF2E55`), Cyberpunk Magenta (`#FF007A`), Electric Cyan (`#00F0FF`), Neon Violet (`#8A2BE2`), and Gold (`#FFB800`).
- **Urgency & Social Proof Badges**:
  - `🔥 ALMOST FULL`: Red gradient pill with pulsing live dot.
  - `🏆 TOP 1 ranked`: Bold metallic gold badge.
  - `✨ CERTIFIED`: Emerald green credential badge.
  - `⚡ FAST SELLING`: Amber warning pill.

---

## 2. Layout Patterns: Netflix Shelves & BookMyShow Discovery

### 2.1 The Cinematic Hero Billboard (Netflix & BookMyShow)
- **Full-Bleed Visual**: 16:9 or 21:9 hero image/video preview with top and bottom dark gradient vignettes.
- **Metadata Stack**:
  1. Top badge: *#1 TRENDING EVENT OF THE WEEK*
  2. Large punchy title (Outfit / Clash Display / Bebas Neue)
  3. Star rating + social proof: `⭐ 4.9 (1.2k reviews) · 850 registered`
  4. Genre & format pills: `Hackathon · 36 Hours · Turing Hall · In-Person`
  5. Action buttons:
     - Primary: `Book Now / Register →` (Vibrant gradient with hover scale)
     - Secondary: `Watch Teaser / Overview` (Glass button with Play icon)
     - Bookmark: `+ Add to My List` (Glass circle button)
- **Interactive Thumbnails**: Thumbnail pagination indicators along the bottom right.

### 2.2 Category Shelves (Horizontal Sliding Carousels)
- Instead of static endless grids, organize discovery into thematic horizontal shelves:
  1. **Top 10 in Your City / Community**: Large numbered typography (1–10) behind vertical poster cards.
  2. **This Weekend's Highlights**: Quick-booking weekend filter.
  3. **Major Hackathons & Competitions**: Prize pools, live countdowns.
  4. **Certified Masterclasses**: Hands-on workshops with credentials.
  5. **Clubs & Collectives Spotlight**: Creator/Club avatar circles with member stats.
- **Carousel Controls**:
  - Smooth desktop hover arrows (`ChevronLeft`, `ChevronRight`) that appear on shelf hover.
  - Touch-friendly horizontal scroll with CSS scroll-snap (`scroll-snap-type: x mandatory`).

### 2.3 Interactive Filter Bar (BookMyShow & District)
- Sticky top pill row:
  - Date chips: `All`, `Today`, `Tomorrow`, `This Weekend`, `Next 7 Days`
  - Category chips: `Hackathons`, `Workshops`, `Talks`, `Exhibitions`, `Meetups`
  - Filter triggers: `Free Entry`, `With Certificate`, `Online`
  - Location Dropdown: Quick city / campus selector with instant result filtering.

---

## 3. Card Mechanics: Netflix Hover Expansion & District Social Proof

### 3.1 Netflix-Style Poster Card (2:3 Aspect Ratio)
- Normal state: Crisp poster visual, date badge top-left, club badge bottom-left.
- Hover state:
  - Smooth scale up (`scale: 1.06`, `z-index: 30`, `transition: 0.25s cubic-bezier(0.16, 1, 0.3, 1)`).
  - Floating preview drawer reveals synopsis, duration, capacity bar, and quick "1-Click Register" button.

### 3.2 District Vibe Card (Landscape 16:10)
- Prominent venue & timing placard.
- Social Proof Avatars: `●●● 140 attending (including 8 club leads)`.
- Capacity Progress Bar: Visual bar showing `% spots filled`.

---

## 4. Ticketing & Registration Flow (Zero Friction)

- **Tier Selection Modal (BookMyShow pattern)**:
  - Clear tiers (e.g. *General Attendee*, *Hacker / Builder*, *VIP / Team Lead*).
  - Live remaining tickets indicator (`Only 14 spots left!`).
- **Instant QR Digital Pass (District / Apple Wallet style)**:
  - Confetti burst on confirmation (`canvas-confetti`).
  - Mobile pass format: Ticket barcode/QR code, calendar add link, map directions link, and download PDF button.
