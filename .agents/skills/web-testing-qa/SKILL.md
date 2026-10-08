---
name: web-testing-qa
description: >-
  Comprehensive web testing, browser inspection, and quality assurance workflows.
  Use when validating frontend applications, testing responsive viewports, checking links,
  auditing accessibility (a11y), verifying console logs, and ensuring error-free user journeys.
---

# Web Testing & Quality Assurance (QA) Skill

This skill provides testing procedures, checklist protocols, and automated verification scripts to ensure web applications are bug-free, highly responsive, and accessible.

---

## 1. Automated Web Inspection Checklist

Whenever testing or auditing a web application:

1. **Network & Console Cleanliness**:
   - Verify 0 uncaught errors in `console.error` and `window.onerror`.
   - Verify all static assets (fonts, images, svgs) return HTTP 200 (no 404 or broken images).
   - Verify API queries handle loading, error, and empty states cleanly.

2. **Responsive Layout Matrix**:
   - **Mobile (360px – 390px)**:
     - Navigation collapses into a touch drawer or bottom sheet.
     - No horizontal document overflow (`overflow-x: hidden`).
     - Touch targets $\ge 44 \times 44\text{px}$.
     - Sticky bottom booking bars for rapid conversion.
   - **Tablet (768px – 1024px)**:
     - Grid columns scale gracefully (e.g. 2 columns).
     - Carousels support smooth touch swipe.
   - **Desktop (1280px – 1920px)**:
     - Content max-width containment (`max-w-7xl` or full-bleed with gutter padding).
     - Hover states, cursor pointers, and keyboard navigation.

3. **Routing & Navigation Integrity**:
   - Every internal link (`Link to="..."`) points to a valid registered route.
   - 404 catch-all page rendered for invalid URLs with a clear "Return Home" button.
   - Browser Back / Forward buttons preserve state (e.g., search queries in URL params).

4. **Interactive Form & Modal Integrity**:
   - Form field validation triggers immediately on blur or submit.
   - Modals trap focus and close on `Escape` key and outside click.
   - Body scroll locked when full-screen drawers or modals are active.

5. **Accessibility (WCAG 2.1 AA Standards)**:
   - Contrast ratio $\ge 4.5:1$ for normal text, $\ge 3:1$ for large headings.
   - Interactive elements have explicit `aria-label` or accessible names.
   - Form inputs have associated `<label>` or `aria-labelledby`.

---

## 2. Test Execution Commands

```bash
# Run unit and component test suites
npm test

# Run Playwright end-to-end user flows
npx playwright test

# Check TypeScript compiler health
npm run build
```
