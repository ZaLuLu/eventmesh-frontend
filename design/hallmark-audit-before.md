# HALLMARK AUDIT (BEFORE): BASELINE REPORT
**Target**: `src/`  
**Date**: October 13, 2026  
**Theme**: Custom ("Campus Funk") · Declared in `design/design.md`  
**Protocol**: Hallmark 57 Anti-Slop Gates & Named Tells

---

## Critical Findings (Ships as Slop)

1. **Tell**: Pure black, pure white (`anti-patterns.md:53`)
   - **Where**: `src/index.css:19-20`, `src/tailwind.config.js:30-31`
   - **Severity**: `critical`
   - **Fix**: Replace synthetic `#FFFFFF` canvas and `#0A0A0A` text with tactile warm paper `--paper: #F6F1E7` and deep ink `--ink: #151130`.

2. **Tell**: Card-in-card visual nesting (`anti-patterns.md:29`, Mandate 3)
   - **Where**: `src/features/events/components/CampusAdmissionPasses.tsx:71-150`, `src/features/clubs/ClubsPage.tsx:70-130`
   - **Severity**: `critical`
   - **Fix**: Remove outer container boxes; cards must exist as standalone physical objects (tickets, stickers, posters) on paper.

3. **Tell**: Stamp missing across all routes (`verbs/audit.md:23`)
   - **Where**: All page files in `src/features/*/`
   - **Severity**: `critical`
   - **Fix**: Add declared `// Hallmark macrostructure: <name>` stamp header to every page file.

4. **Tell**: Same placeholder poster everywhere (`anti-patterns.md:59`, Audit V-02)
   - **Where**: `src/features/events/components/EventCardModern.tsx`, `src/design-system/PosterArtwork.tsx`
   - **Severity**: `critical`
   - **Fix**: Deploy generative seeded `PosterArt` SVG engine that renders deterministic gig posters per event and club.

---

## Major Findings (Looks AI-Generated / Template Drift)

5. **Tell**: Single SaaS face everywhere (`anti-patterns.md:17`, Audit S-07)
   - **Where**: `tailwind.config.js:59-62`, `src/index.css:1-2`
   - **Severity**: `major`
   - **Fix**: Replace generic Plus Jakarta Sans with Bricolage Grotesque (800) for display, Instrument Serif italic (1 word per heading), and Geist for body UI.

6. **Tell**: Jargon & Engineer-Speak labels (Audit V-03)
   - **Where**: `src/features/events/components/CampusRadarFeed.tsx:72`, `src/app/PublicFooter.tsx:42,52,57,76`
   - **Severity**: `major`
   - **Fix**: Replace `01 // EXPLORE`, `ACADEMIC RUN-OF-SHOW`, `AUTONOMOUS COLLECTIVES`, `DOSSIER` with plain human labels.

7. **Tell**: All-caps title formatting (Audit V-04)
   - **Where**: `src/features/events/HomePage.tsx`, `src/features/events/ExplorePage.tsx`
   - **Severity**: `major`
   - **Fix**: Switch headings to expressive Title Case in Bricolage Grotesque.

8. **Tell**: Footer gimmicks & system telemetry (Audit V-05)
   - **Where**: `src/app/PublicFooter.tsx:31-34,139-144`
   - **Severity**: `major`
   - **Fix**: Remove UTC clock, coordinates, and design token links; build useful link columns plus huge cropped wordmark.

9. **Tell**: Competing accent colors without role distinction (Audit V-11)
   - **Where**: `src/index.css:70-73`
   - **Severity**: `major`
   - **Fix**: Eliminate muddy teal `#17645F` in admin; standardize public on Cobalt `#0047FF` + sticker palette, and admin on Lime `#D4F25A`.

10. **Tell**: Overlong button labels (Audit V-09)
    - **Where**: `src/features/auth/DevAccountsPage.tsx:112-140`
    - **Severity**: `major`
    - **Fix**: Limit button labels to maximum 3 concise words.

---

## Minor Findings (Small Taste / Layout Issues)

11. **Tell**: Missing page container shell (Audit V-01)
    - **Where**: `src/features/events/ExplorePage.tsx`, `src/features/events/EventDetailPage.tsx`, `src/features/registration/RegisterPage.tsx`
    - **Severity**: `minor`
    - **Fix**: Wrap all public routes in unified `PageShell` (`max-width: 1320px`, responsive clamp padding).

12. **Tell**: Dead layout gaps on two-column pages (Audit V-06)
    - **Where**: `src/features/registration/RegisterPage.tsx:80-120`, `src/features/events/EventDetailPage.tsx:180-240`
    - **Severity**: `minor`
    - **Fix**: Refactor to balanced CSS Grid layouts (`minmax(0,1fr) 380px`).

13. **Tell**: Breadcrumb and venue text truncation without wrapping (Audit V-07)
    - **Where**: `src/features/events/EventDetailPage.tsx:85-110`
    - **Severity**: `minor`
    - **Fix**: Shorten breadcrumb to `Events › Title` with line clamp and allow venue to wrap up to 2 lines with tooltip.

---

## Summary
**4 critical · 6 major · 3 minor** (Total: 13 defects identified)
Phase C Baseline Audit Complete. Zero failing gates target established for Phase G.
