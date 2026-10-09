# Component Sources & Open-Source Licences

This document records the upstream sources, repositories, authors, and licences for all third-party primitives, libraries, and design patterns adopted or adapted in the EventMesh "Champion & Lavender" landing page implementation.

---

## 1. Upstream Library Licences

| Package / Library | Upstream URL & Repository | Author / Organisation | Licence Type | Summary of Terms & Compliance |
|---|---|---|---|---|
| **`embla-carousel-react`** | `https://github.com/davidjerleke/embla-carousel` | David Jerleke | **MIT Licence** | Free for commercial and private use. Requires copyright notice in source distributions. |
| **`@radix-ui/react-toggle-group`** | `https://github.com/radix-ui/primitives` | WorkOS / Radix UI | **MIT Licence** | Unstyled accessible primitives. Permissive commercial use with attribution. |
| **`@radix-ui/react-tabs`** | `https://github.com/radix-ui/primitives` | WorkOS / Radix UI | **MIT Licence** | Permissive commercial use with attribution. |
| **`@radix-ui/react-popover`** | `https://github.com/radix-ui/primitives` | WorkOS / Radix UI | **MIT Licence** | Permissive commercial use with attribution. |
| **`@radix-ui/react-select`** | `https://github.com/radix-ui/primitives` | WorkOS / Radix UI | **MIT Licence** | Permissive commercial use with attribution. |
| **`@radix-ui/react-dialog`** | `https://github.com/radix-ui/primitives` | WorkOS / Radix UI | **MIT Licence** | Permissive commercial use with attribution. |
| **`cmdk`** | `https://github.com/pacocoursey/cmdk` | Paco Coursey | **MIT Licence** | Fast, unstyled command menu React component. Permissive commercial use. |
| **`framer-motion` / `motion`** | `https://github.com/motiondivision/motion` | Motion Division / Matt Perry | **MIT Licence** | Modern hardware-accelerated animation & layout engine for React. Permissive commercial use. |
| **`torph`** | `https://github.com/lochie/torph` | Lochie Axon | **MIT Licence** | Dependency-free animated text morphing component for React with place-value numeric rolling. Permissive commercial use. |
| **`lucide-react`** | `https://github.com/lucide-icons/lucide` | Lucide Contributors | **ISC Licence** | Permissive open-source icon library. Free for all use. |
| **`clsx` & `tailwind-merge`** | `https://github.com/lukeed/clsx`<br>`https://github.com/dcastil/tailwind-merge` | Luke Edwards & Dany Castillo | **MIT Licence** | Class composition and Tailwind collision resolver. Permissive use. |

---

## 2. Typography Licences

| Font Family | Designer / Foundry | Source / Upstream | Licence Type | Compliance Notes |
|---|---|---|---|---|
| **Instrument Serif** | Instrument & Rodrigo Fuenzalida | `https://github.com/Instrument/instrument-serif` / Google Fonts | **SIL Open Font License 1.1 (OFL)** | Permissive open-source font licence. Self-hosted `.woff2` files in `/public/fonts/` or imported via Google Fonts CDN. Free for web embedding and distribution. |
| **Inter** (Variable) | Rasmus Andersson | `@fontsource-variable/inter` | **SIL Open Font License 1.1 (OFL)** | Self-hosted npm package already installed in project. |

---

## 3. Component Code Adaptation & Provenance

All restyled UI primitives (`Button`, `Badge`, `ToggleGroup`, `Tabs`, `Select`, `Skeleton`, `Sheet`, `Popover`, `Command`) and custom composites (`EventCard`, `PromoCarousel`, `NewEventsRail`, `EventsToolbar`) are implemented as bespoke clean-room components using the MIT-licenced Radix UI headless APIs and Tailwind CSS tokens. No proprietary code without a verified permissive open-source licence has been included.
