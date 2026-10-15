# Redesign audit evidence

Captured 15 October 2026 from the installed Vite dev server at localhost:5175, explicitly in mock mode. Fresh headless Chromium context; mock defaults to platform administrator. No backend admission or production data verified.

375, 768 and 1440 CSS-pixel widths; viewport height 900. Home, Explore, login, calendar and admin are full-page captures; other captures are viewport images. Seed data and date influence results. Screenshot presence is not evidence of a completed user journey.

`results.json` records route headings/text and root widths. `extra-results.json` records axe findings on six desktop routes (up to four example nodes per rule), mobile filter focus sample and Home section positions. Axe ran with color contrast enabled and WCAG 2/2.1/2.2 tags. The first axe attempt failed because it needed an explicit browser context; the saved results are from the corrected run.

Theme check: inside `.admin-scope`, computed canonical canvas was #0B0814 but --paper #FAF8FF; canonical ink #FAF8FF but --ink #120D24; canonical surface #1A1333 but --card #FFFFFF. This confirms inherited aliases resolving in the root light scope.

## Captures

- [admin-1440.png](admin-1440.png)
- [admin-375.png](admin-375.png)
- [admin-768.png](admin-768.png)
- [calendar-1440.png](calendar-1440.png)
- [calendar-375.png](calendar-375.png)
- [calendar-768.png](calendar-768.png)
- [checkin-1440.png](checkin-1440.png)
- [checkin-375.png](checkin-375.png)
- [checkin-768.png](checkin-768.png)
- [clubs-1440.png](clubs-1440.png)
- [clubs-375.png](clubs-375.png)
- [clubs-768.png](clubs-768.png)
- [dashboard-1440.png](dashboard-1440.png)
- [dashboard-375.png](dashboard-375.png)
- [dashboard-768.png](dashboard-768.png)
- [detail-1440.png](detail-1440.png)
- [detail-375.png](detail-375.png)
- [detail-768.png](detail-768.png)
- [explore-1440.png](explore-1440.png)
- [explore-375.png](explore-375.png)
- [explore-768.png](explore-768.png)
- [home-1440.png](home-1440.png)
- [home-375.png](home-375.png)
- [home-768.png](home-768.png)
- [login-1440.png](login-1440.png)
- [login-375.png](login-375.png)
- [login-768.png](login-768.png)
- [registration-1440.png](registration-1440.png)
- [registration-375.png](registration-375.png)
- [registration-768.png](registration-768.png)
- [registrations-1440.png](registrations-1440.png)
- [registrations-375.png](registrations-375.png)
- [registrations-768.png](registrations-768.png)
