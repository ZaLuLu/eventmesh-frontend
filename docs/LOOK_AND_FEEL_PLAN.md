<!-- Hallmark · pre-emit critique: P4 H4 E4 S5 R5 V4. Subjective proposal review only. -->
# EventMesh — what can look and feel better

**Status:** design proposal only, 15 October 2026. No implementation authorized by this document. No source code changed for this review. Earlier implementation changes remain in place; this review neither extends nor reverts them.

## Direction

Make EventMesh feel like a trustworthy public event service: easy to browse, easy to book, and easy to use at the venue. Operational screens should support fast scanning; public screens should remain welcoming and readable.

Keep the client-requested purple, light-first presentation, Geist, event artwork, organization identity and mandatory 3D tickets. Design for general audiences across organization types, with equal attention to phones and laptops. Backend behavior, permissions, endpoints and capabilities are outside this plan.

This is a focused visual and interaction follow-up to `REDESIGN_PLAN.md`, based on the current frontend, `DESIGN.md` and existing implementation captures. It does not repeat already-fixed theme inheritance or demo-registration findings. Existing captures cover mock data; proposals for untested states require design review rather than claims of verified behavior. Hallmark remains the house standard; the previously recorded missing skills remain unavailable.

## Ten highest-value improvements

Effort: S = contained component/content change; M = coordinated screen work; L = several related screens and interaction states. These are relative estimates, not delivery promises.

| Priority | What can improve and current evidence | Proposed treatment | Benefit | Risk / effort |
|---|---|---|---|---|
| 1 | **Event cards make titles, logistics and actions compete.** Titles/subtitles are clamped; venue is truncated beside the action (`src/design-system/EventTicketCard.tsx:30–36`). | Use a consistent reading order: artwork → host → title → date/time → location → price/status → action. Give logistics the full card width and put the action in its own footer. Allow long titles more room; omit a subtitle that only repeats the host. | People can compare events without opening every card. | Taller cards may show fewer records per viewport / M. |
| 2 | **The wallet gives a large fixed region to an identity lanyard.** It starts in 3D but reserves 580–660px (`src/features/dashboard/AttendeeDashboardPage.tsx:82,331–380`). | Put the next issued ticket and its date/status first. Keep the mandatory interactive 3D ticket visible in a viewport-fitting stage. Put “Present QR” and ticket details beside it on laptop and directly beneath it on mobile. Move profile editing below tickets. Distinguish the identity badge from an event admission ticket. | The signature interaction remains useful when an attendee needs to enter a venue quickly. | Resizing can affect drag handling, readability and QR reliability / L. |
| 3 | **Mobile navigation has two labels for the same destination.** Tickets and Profile both point to the wallet (`src/app/PublicShell.tsx:19–28,51–70`). | Use one Tickets destination. Put profile/settings in the account menu, while retaining existing deep links. Keep bottom navigation to four clearly distinct tasks, with one selected state. | Less uncertainty about where to retrieve a ticket or edit an account. | Habit changes; preserve access to all existing destinations / M. |
| 4 | **Detail pages spread information across seven tabs and two action regions.** (`src/features/events/EventDetailPage.tsx:38,319–345,533–565,708–747`). | Lead with title, host, time/timezone, venue, eligibility and price. Follow with description and only the sections containing useful information. Keep one booking summary on laptop; use one compact mobile action bar that clears bottom navigation. Do not show a tier picker when there is no meaningful choice. | Visitors understand the event and next step with less exploration. | Important rules could become less visible; preserve all supplied content / M. |
| 5 | **Button meaning varies between public and admin surfaces.** Public primary is dark; admin primary is purple (`src/design-system/primitives/Button.tsx:51–78`); header actions are pills (`src/app/PublicHeader.tsx:65–82`). | Make the principal action purple throughout; secondary actions use a neutral border, tertiary actions use text. Use one control radius and consistent heights. Reserve pills for tags/statuses. Keep destructive actions semantically distinct. | Action priority becomes recognizable across the product. | Too many purple buttons would erase hierarchy; identify the primary action per region / M. |
| 6 | **Light-mode polish is incomplete in operational screens.** Roster headings and secondary text still use translucent white, and the table has a 750px minimum width (`src/features/admin/AdminRegistrationsPage.tsx:133–165,220–223`). | Use neutral surfaces, readable text, subtle dividers and a clear filter toolbar. On mobile prioritize attendee, event and status; put secondary details in a disclosure. Retain a horizontally scrollable full table where needed. | Staff can scan records reliably in the requested light theme. | Hiding columns can conceal information; retain access to full details and exports / M. |
| 7 | **Forms still use campus-specific language and varied geometry.** Registration contains campus guidance and multiple rounded panel styles (`src/features/registration/RegisterPage.tsx:150,206–209,380–439`). | Use a bounded, consistent form layout, persistent labels, a clear step heading and a compact event summary. Use neutral attendee/organization wording unless the active context is institutional. Surface existing academic requirements accurately when applicable. | General audiences understand what information is needed and why. | Copy cannot remove service requirements or change eligibility / M. |
| 8 | **Discovery can communicate selection more clearly.** Home and Explore have separate filter arrangements (`src/features/events/HomePage.tsx:164–224`; `src/features/events/ExplorePage.tsx:84–112`). | Standardize filter order, selected chips, result count, clear-all and empty-result recovery. Keep search visible and filters close to results. On phones show a short selection summary next to the filter button. Reflect only supported filter behavior. | Users can tell why they are seeing a result set and recover from over-filtering. | A visual reorganization must preserve query semantics and saved links / M. |
| 9 | **Calendar information becomes tiny and selection is click-oriented.** Seven-column grid, click handler and 9–11px labels (`src/features/calendar/CalendarPage.tsx:229–316`). | Default to an agenda on narrow screens; retain month view as a choice. Use clear date groups and named selectable day controls. Expose selected date and event count in text. | Planning remains readable on a phone and usable without a mouse. | Calendar habits differ; keep the existing month workflow available / M. |
| 10 | **Featured artwork can lose information when cropped.** The hero uses a fixed aspect ratio and `object-cover` (`src/design-system/PanoramicHeroCarousel.tsx:36–47`). | Establish separate poster/banner treatments: preserve text-heavy posters with contained framing; crop photographic banners around an intentional focal point. Show essential event details as real text outside the image. Use a restrained branded fallback when no art is supplied. | Real event artwork supplies personality without sacrificing readability. | Different artwork proportions can create uneven height; specify bounded frames / S–M. |

## Proposed screen compositions

### Home and Explore

- **Laptop:** short featured event → search/filter row → results → organizer discovery. Use a side filter panel only when cards retain a readable width.
- **Mobile:** compact featured event → search → filter summary/result count → one-column cards. Organizer content follows results.
- Keep event art visually prominent. Use purple for actions, selection and focus; avoid tinting every panel.
- Review acceptance: long event titles remain identifiable, price and location do not compete for space, and selected filters are visible without reopening the dialog.

### Event detail and registration

- **Laptop:** content column plus booking summary; title and logistics appear before long descriptive content.
- **Mobile:** single reading column with one booking action region. The action bar must not cover the final field, validation message or navigation.
- Registration should explain the current step, what is required and what happens next. Preserve entered information on failure and place an error beside the relevant field.
- Review acceptance: a visitor can locate date, venue, eligibility, price and next action without switching tabs; a failed submission has a clear recovery path. Imported events visibly identify their provider destination.

### Wallet and mandatory 3D ticket

- **Laptop:** next ticket in a 3D stage with logistics and actions alongside; additional tickets below.
- **Mobile:** ticket title/status → responsive 3D stage → Present QR/details → other tickets → account information.
- The normal ticket experience remains 3D without opt-in. Support a stable reduced-motion pose, equivalent named controls and a usable WebGL-failure fallback. Leave vertical page scrolling available around the interaction.
- Review acceptance: ticket actions are reachable without dragging; QR remains readable when presented; checked-in, waitlisted and cancelled states cannot be confused. Do not imply admission before the existing service confirms it.

### Operations

- **Laptop:** organization context → page title and primary action → search/filters → table → pagination/status.
- **Mobile:** selected organization/event remains visible; prioritize the current task and move secondary row details into an accessible expansion.
- Review acceptance: light-mode text and boundaries remain readable, state is conveyed in words, and pending/error feedback belongs to the affected row or action.

## Visual polish specification

Apply the existing system consistently; no new visual library or brand direction is needed.

| Element | Proposed rule | Why / trade-off / effort |
|---|---|---|
| Typography | Geist only; 16px body, 14px routine UI, 12px supporting captions, 24–28px page titles and up to 36px featured titles. Use weight and spacing before uppercase labels. | Better reading hierarchy; some panels grow / S. |
| Spacing | Use 8/12/16/24/32px gaps, 16px phone gutters and 24–32px laptop gutters. Keep related label/value pairs closer than separate sections. | Easier grouping; requires checking long content / S. |
| Surfaces | Light neutral canvas, white content panels, subtle neutral borders; shadows only when a surface floats above another. | Clear structure; borders must still distinguish controls / S. |
| Purple | Principal actions, active selection, focus and restrained brand details. Semantic success/error colors retain their meaning. | Strong client identity; overuse reduces action emphasis / S. |
| Icons | One existing icon family, consistent stroke/weight and optical size; text for unfamiliar actions. | More coherent controls; avoid removing meaningful labels / S. |
| Motion | Brief feedback for hover/press/overlays; no animated counters or constant ambient motion. Preserve purposeful ticket interaction. | Calmer use; must retain visible progress during actual waits / S–M. |
| States | Design loading, empty, error, pending and success alongside each screen, using factual content and an appropriate next action. | Greater trust and continuity; avoid success messages before confirmation / M. |

These are refinement targets, not a claim that every existing component currently violates them. The priority table supplies the observed examples.

## Suggested order — planning only

1. **Visual consistency:** button hierarchy, type scale, spacing, light-mode roster contrast and card metadata. Review one shared component sheet before screen-wide changes.
2. **Public journey:** compare Home, Explore, detail and registration together on phone and laptop; check action placement and consistent vocabulary.
3. **Signature ticket experience:** refine the mandatory 3D ticket with real mobile viewport constraints, distinct identity/admission content and accessible controls.
4. **Operational polish:** roster, calendar, scanner and editor states; keep organizational scope visible.

Before implementation, prepare representative visual proposals for a long-title event, an imported provider event, a company/community organizer, an institution event, a ticket wallet, and an operational roster. Check 375/768/1440px layouts plus narrow-width and zoom behavior. Review keyboard order, error recovery, loading stability and readable status distinctions. No implementation is part of this document.

## Optional design questions

These refine the proposal; they do not reopen the confirmed brand, audience or 3D requirements.

- Are there approved event posters, organization logos and client screenshots to use when judging the final artwork treatment?
- Which part of the existing 3D interaction matters most to the client: ticket handling, the tear/admission action, the lanyard, or all three?
- Which experience should receive the first visual proposal: discovery, event booking, or the ticket wallet?
