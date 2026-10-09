# Skills Used in EventMesh "Calm Coral" Rebuild

This document records all discovered workspace skills, global skills, MCP tools, and plugins evaluated for the EventMesh frontend UI rebuild. Per Step 0 of the specification, each skill was inspected and evaluated against the "Calm Coral" design brief.

---

## 1. Skills Discovery & Evaluation Table

| Skill Name | Source / Type | What It Covers | Used (Yes/No) | Where Applied & Implementation Details | Conflict with Brief & Resolution |
|---|---|---|---|---|---|
| **ui-ux-design** | Workspace (`.agents/skills/ui-ux-design`) | Modern UI/UX guidelines: typography, hierarchy, contrast, micro-interactions, responsive design, dark mode. | **Yes (Selective)** | Applied typography scale, visual rhythm, 44px touch targets, clear one-primary-action CTA structure. | **Conflict:** Recommends dark cinematic mode (`#0B0C10`), heavy glassmorphism (`backdrop-blur-md`), and card hover lift (`scale: 1.06`). **Resolution:** Brief mandates light flat "Calm Coral", solid surfaces, zero glassmorphism/blur, and flat underline hover on event cards without lift/scale. Followed brief strictly. |
| **web-testing-qa** | Workspace (`.agents/skills/web-testing-qa`) | Web QA strategies, end-to-end testing, responsive regression, accessibility checklists. | **Yes** | Applied to unit tests (`vitest`), layout audit Playwright suite (`npm run audit:layout`), and responsive viewport verification. | None. |
| **react-patterns** | Global (`~/.gemini/config/skills/react-patterns`) | React hooks, composition, component boundaries, state management, render optimization. | **Yes** | Applied across all UI components, container/presenter splits, error boundaries around vendor components, accessible state hooks. | None. |
| **react-best-practices** | Global (`~/.gemini/config/skills/react-best-practices`) | Server/client split, props drilling prevention, memoization, lifecycle discipline. | **Yes** | Applied in component tree isolation, avoiding unnecessary re-renders in filters and modals. | None. |
| **tailwind-patterns** | Global (`~/.gemini/config/skills/tailwind-patterns`) | Tailwind utility architectures, design tokens, configuration mapping, CSS variable binding. | **Yes** | Applied in `tailwind.config.js` and `src/index.css` to map CSS variables (`--bg`, `--surface`, `--line`, `--accent`, etc.) to semantic utilities without hardcoded hexes. | None. |
| **web-design-guidelines** | Global (`~/.gemini/config/skills/web-design-guidelines`) | Web Interface Guidelines: semantic HTML, focus states, forms, responsive layouts. | **Yes** | Applied to semantic landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`), 2px focus-visible outlines, form input layout standards. | None. |
| **ui-a11y** | Global (`~/.gemini/config/skills/ui-a11y`) | WCAG AA compliance, color contrast verification, aria attributes, keyboard navigation. | **Yes** | Applied to ensure 4.5:1+ contrast on all text, 10px club dots with contrast utility, keyboard carousel navigation, modal trap & focus restoration. | None. |
| **screen-reader-testing** | Global (`~/.gemini/config/skills/screen-reader-testing`) | Accessible naming, live regions, `aria-hidden` backgrounds, semantic headings. | **Yes** | Applied to `GradientBackdrop` (`aria-hidden="true"`, `pointer-events-none`), accessible icon buttons, modal announcements. | None. |
| **mobile-design** | Global (`~/.gemini/config/skills/mobile-design`) | Mobile-first touch patterns, responsive gutters, sticky bars, drawer/sheet navigation. | **Yes** | Applied 16px mobile gutters, sticky filter & header ≤120px combined height, bottom sheets for mobile filters, 44px tap targets. | None. |
| **minimalist-ui** | Global (`~/.gemini/config/skills/minimalist-ui`) | Extreme simplicity, clutter reduction, functional whitespace, high content-to-chrome ratio. | **Yes (Selective)** | Applied calm single-action rule, removal of extraneous marketing badges, clean flat hairline dividers. | **Conflict:** Bans Inter and Lucide icons. **Resolution:** Brief specifically requires "Inter (self-hosted variable)" and preserves existing Lucide icons. Followed brief strictly. |
| **ui-tokens** | Global (`~/.gemini/config/skills/ui-tokens`) | Token architecture, naming conventions, light/dark and admin scoping. | **Yes** | Applied to establish CSS variable tokens for Public theme (`--accent`, `--subtle`, etc.) and Admin scope (`.admin-scope` with `--sidebar #0F1A24`). | None. |
| **ui-motion** | Global (`~/.gemini/config/skills/ui-motion`) | Choreographed transitions, ease curves, reduced motion media queries. | **Yes (Selective)** | Applied subtle opacity + 8-12px translate reveal (200-300ms ease-out), color hovers (150ms), and `@media (prefers-reduced-motion: reduce)`. | **Conflict:** Suggests 3D tilts, spring bouncing, and decorative looping. **Resolution:** Brief bans 3D and decorative loops; only GradientBackdrop animates and must freeze under reduced motion / tab blur. Followed brief strictly. |
| **webapp-testing** | Global (`~/.gemini/config/skills/webapp-testing`) | Playwright browser automation, multi-viewport layout testing, scriptable assertion suites. | **Yes** | Applied to build `scripts/audit-layout.ts` for automated multi-viewport layout audits across 360, 768, 1280, and 1920px. | None. |
| **vitest-skill** | Global (`~/.gemini/config/skills/vitest-skill`) | Unit & integration test execution, assertion patterns, mocking. | **Yes** | Applied to verify all existing domain and contract tests remain passing without regressions. | None. |
| **frontend-architecture** | Global (`~/.gemini/config/skills/frontend-architecture`) | Clean frontend layering, separation of UI from API/ports/adapters, robust design systems. | **Yes** | Applied to keep API contracts, adapters, stores, and hooks untouched while isolating the UI rework inside `src/design-system/` and page features. | None. |
| **chrome-devtools-mcp** | MCP Server | Interactive browser inspection, DOM snapshots, layout evaluation. | **Yes** | Used to audit layout rendering, inspect computed CSS styles, and verify tap targets and contrast. | None. |
| **browser_subagent** | Native Tool | Multi-viewport autonomous visual inspection and session recording. | **Yes** | Used to verify rendered pages at required breakpoints (360px, 390px, 768px, 1024px, 1280px, 1440px, 1920px). | None. |

---

## 2. Summary of Conflicts and Resolution Principles

1. **Flat vs Glass/3D:**
   - Any general skill recommending glassmorphism, blur backdrops, 3D tilt, or elevation shadows is overridden by the Calm Coral specification: Flat surfaces, 1px hairlines (`--line`), and a single light shadow (`0 4px 16px rgba(27,26,25,0.08)`) restricted to floating dropdowns/sheets/toasts.
2. **Typography:**
   - The brief mandates Inter (self-hosted variable) with a strict rule: **Nothing below 13px anywhere**. All `text-[10px]`, `text-[11px]`, and `text-xs` (12px) in existing files are elevated to 13px (caption) or 14px (small).
3. **Vendor Component Isolation:**
   - Vendor code in `src/vendor/ui/` (`coral-dawn.jsx`) is never modified directly. It is wrapped inside `src/design-system/GradientBackdrop.tsx` with fallback to solid `#FDEBE6`, `aria-hidden`, and tab visibility/reduced motion handlers.
