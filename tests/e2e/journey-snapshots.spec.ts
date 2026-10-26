import { test, expect } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const BASE_OUT = path.resolve(process.cwd(), '../audit/snapshots')

function ensureDir(subDir: string) {
  const dir = path.join(BASE_OUT, subDir)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

test.describe('End-to-End Visual Audit & Snapshot Ingestion', () => {
  test.beforeAll(() => {
    ensureDir('01_showcase')
    ensureDir('02_registration')
    ensureDir('03_tickets')
    ensureDir('04_admin')
    ensureDir('05_primitives')
  })

  test.beforeEach(async ({ page }) => {
    // Set standard desktop viewport for baseline consistency (Hallmark / Impeccable standard)
    await page.setViewportSize({ width: 1440, height: 900 })
  })

  // =========================================================================
  // 1. SHOWCASE & DISCOVERY FLOW
  // =========================================================================
  test('01: Landing & Showcase Discovery State Snapshots', async ({ page }) => {
    // 1. Grid
    await page.goto('/explore', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await page.screenshot({
      path: path.join(BASE_OUT, '01_showcase/grid.png'),
      fullPage: false,
    })

    // 2. Filters open / category active
    const categoryBtn = page.getByRole('button', { name: /Hackathons|Workshops|Conferences|All Categories/i }).first()
    if (await categoryBtn.isVisible()) {
      await categoryBtn.click()
      await page.waitForTimeout(400)
    }
    const filterInput = page.locator('input[placeholder*="Search"]').first()
    if (await filterInput.isVisible()) {
      await filterInput.fill('Hackathon')
      await page.waitForTimeout(400)
    }
    await page.screenshot({
      path: path.join(BASE_OUT, '01_showcase/filters_open.png'),
      fullPage: false,
    })

    // 3. Card Hover
    if (await filterInput.isVisible()) {
      await filterInput.clear()
      await page.waitForTimeout(400)
    }
    const firstCard = page.locator('[data-testid="event-ticket-card"]').first()
    if (await firstCard.isVisible()) {
      await firstCard.scrollIntoViewIfNeeded()
      await firstCard.hover()
      await page.waitForTimeout(400)
      await page.screenshot({
        path: path.join(BASE_OUT, '01_showcase/card_hover.png'),
        fullPage: false,
      })
    }
  })

  // =========================================================================
  // 2. REGISTRATION & CHECKOUT FLOW
  // =========================================================================
  test('02: Event Detail & Registration Pipeline Snapshots', async ({ page }) => {
    // Go to event detail page with ticket tiers
    await page.goto('/events/cyberpulse-autonomous-ai-hackathon-2026', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)

    // 1. Tier Selection State
    const tierPanel = page.locator('text=Admission Pass').locator('xpath=ancestor::div[contains(@class, "rounded-panel")]').first()
    if (await tierPanel.isVisible()) {
      await tierPanel.scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)
      await tierPanel.screenshot({
        path: path.join(BASE_OUT, '02_registration/tier_selection.png'),
      })
    } else {
      await page.screenshot({
        path: path.join(BASE_OUT, '02_registration/tier_selection.png'),
        fullPage: false,
      })
    }

    // Go to registration page
    await page.goto('/events/cyberpulse-autonomous-ai-hackathon-2026/register', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)

    // Clear inputs to trigger validation error
    const nameInput = page.locator('input#name, input[name="name"]').first()
    const phoneInput = page.locator('input#phone, input[name="phone"]').first()
    if (await nameInput.isVisible()) {
      await nameInput.fill('')
      if (await phoneInput.isVisible()) await phoneInput.fill('')

      // Click Continue to Details to trigger error
      const continueBtn = page.getByRole('button', { name: /Continue to Details|Continue to Review|Claim Pass|Fast Admission/i }).first()
      await continueBtn.click()
      await page.waitForTimeout(400)

      // 2. Form Empty Error State
      await page.screenshot({
        path: path.join(BASE_OUT, '02_registration/form_empty_error.png'),
        fullPage: false,
      })

      // 3. Form Filled State
      await nameInput.fill('Aditya Narayan')
      await phoneInput.fill('+91 9876543210')
      const regInput = page.locator('input#regNumber, input[name="regNumber"]').first()
      if (await regInput.isVisible()) await regInput.fill('EM-2026-0814')
      const branchInput = page.locator('input#branch, input[name="branch"]').first()
      if (await branchInput.isVisible()) await branchInput.fill('Computer Science & AI')

      await page.waitForTimeout(300)
      await page.screenshot({
        path: path.join(BASE_OUT, '02_registration/form_filled.png'),
        fullPage: false,
      })
    }
  })

  // =========================================================================
  // 3. DIGITAL PASS, STAMP & TICKET TEARING
  // =========================================================================
  test('03: Digital Pass, 3D Stamp & Ticket Tearing Interaction Snapshots', async ({ page }) => {
    // Ensure attendee persona session active
    await page.goto('/dev/accounts', { waitUntil: 'networkidle' })
    const switchAttendee = page.getByRole('button', { name: /Switch to Aditya Narayan|Attendee/i }).first()
    if (await switchAttendee.isVisible()) {
      await switchAttendee.click()
      await page.waitForTimeout(600)
    }

    // Navigate to Attendee Dashboard
    await page.goto('/attendee/dashboard', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)

    // 1. ID Card Front
    const idCard = page.locator('[title*="Click card to flip between Front and Back"], [title*="flip"]').first()
    if (await idCard.isVisible()) {
      await idCard.scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)
      await idCard.screenshot({
        path: path.join(BASE_OUT, '03_tickets/id_card_front.png'),
      })

      // 2. ID Card Back (Click to flip 3D)
      await idCard.click()
      await page.waitForTimeout(900) // Wait for 3D flip animation
      await idCard.screenshot({
        path: path.join(BASE_OUT, '03_tickets/id_card_back.png'),
      })
    }

    // 3. 3D Desk Stamp Studio (Idle)
    await page.goto('/stamp', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({
      path: path.join(BASE_OUT, '03_tickets/stamp_idle.png'),
      fullPage: false,
    })

    // 4. 3D Desk Stamp Active (Press Stamp)
    const stampBtn = page.locator('button.stp-btn, .stp-btnrow button').first()
    if (await stampBtn.isVisible()) {
      await stampBtn.click()
    } else {
      await page.keyboard.press('Enter')
    }
    await page.waitForTimeout(1000) // Wait for physical stamp bounce
    await page.screenshot({
      path: path.join(BASE_OUT, '03_tickets/stamp_active.png'),
      fullPage: false,
    })

    // 5. Ticket Tearing: Open a ticket on Attendee Dashboard
    await page.goto('/attendee/dashboard', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)

    const presentBtn = page.getByRole('button', { name: /Present Pass|View Ticket|View Admitted Pass/i }).first()
    if (await presentBtn.isVisible()) {
      await presentBtn.click()
      await page.waitForTimeout(800)

      // Ticket is open in modal.
      const simulateBtn = page.getByRole('button', { name: /Simulate Scan|Tear Stub/i }).first()
      if (await simulateBtn.isVisible()) {
        await simulateBtn.click()
        await page.waitForTimeout(1000) // Wait for physical tear separation & approved seal
      }

      // Capture torn ticket state
      await page.screenshot({
        path: path.join(BASE_OUT, '03_tickets/ticket_torn.png'),
        fullPage: false,
      })

      // 6. Ticket Reattached: Trigger Re-attach if visible
      const reattachBtn = page.getByRole('button', { name: /Re-attach/i }).first()
      if (await reattachBtn.isVisible()) {
        await reattachBtn.click()
        await page.waitForTimeout(600)
      }
      await page.screenshot({
        path: path.join(BASE_OUT, '03_tickets/ticket_reattached.png'),
        fullPage: false,
      })
    }
  })

  // =========================================================================
  // 4. ADMIN DASHBOARD & VERIFICATION CONSOLE
  // =========================================================================
  test('04: Admin Dashboard, Attendee Roster & Button Matrix Snapshots', async ({ page }) => {
    // Switch to Club Admin
    await page.goto('/dev/accounts', { waitUntil: 'networkidle' })
    const switchAdmin = page.getByRole('button', { name: /DevCraft|Club Admin|Switch to DevCraft/i }).first()
    if (await switchAdmin.isVisible()) {
      await switchAdmin.click()
      await page.waitForTimeout(600)
    }

    // 1. Admin Overview
    await page.goto('/admin', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await page.screenshot({
      path: path.join(BASE_OUT, '04_admin/overview.png'),
      fullPage: false,
    })

    // 2. Roster Table
    await page.goto('/admin/registrations', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await page.screenshot({
      path: path.join(BASE_OUT, '04_admin/roster_table.png'),
      fullPage: false,
    })

    // 3. Action Modals / Checkin desk
    await page.goto('/admin/checkin', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await page.screenshot({
      path: path.join(BASE_OUT, '04_admin/action_modals.png'),
      fullPage: false,
    })

    // 4. Button Matrix on /styleguide
    await page.goto('/styleguide', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    const buttonSection = page.locator('text=Buttons & Actions').locator('xpath=ancestor::section').first()
    if (await buttonSection.isVisible()) {
      await buttonSection.scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)
      await buttonSection.screenshot({
        path: path.join(BASE_OUT, '04_admin/button_matrix.png'),
      })
    } else {
      await page.screenshot({
        path: path.join(BASE_OUT, '04_admin/button_matrix.png'),
        fullPage: false,
      })
    }
  })

  // =========================================================================
  // 5. PRIMITIVES, MODALS, DROPDOWNS & TOAST ALERTS
  // =========================================================================
  test('05: Primitives, Expanded Dropdowns, Modals & Toast Alerts Snapshots', async ({ page }) => {
    await page.goto('/events/cyberpulse-autonomous-ai-hackathon-2026', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)

    // 1. Dropdown Expanded (Account Menu in Header)
    const accountBtn = page.locator('button[aria-label="Account menu"]').first()
    if (await accountBtn.isVisible()) {
      await accountBtn.click()
      await page.waitForTimeout(300)
      await page.screenshot({
        path: path.join(BASE_OUT, '05_primitives/all_dropdowns_expanded.png'),
        fullPage: false,
      })
      // Close dropdown by clicking button again
      await accountBtn.click()
      await page.waitForTimeout(300)
    }

    // 2. Modals (Live Calendar Modal)
    const calBtn = page.getByRole('button', { name: /Add to calendar/i }).first()
    if (await calBtn.isVisible()) {
      await calBtn.click()
      await page.waitForTimeout(500)
      await page.screenshot({
        path: path.join(BASE_OUT, '05_primitives/modals.png'),
        fullPage: false,
      })

      // 3. Toast alerts (Click Copy WebCal URL to trigger toast)
      const copyBtn = page.locator('button:has-text("Copy")').last()
      if (await copyBtn.isVisible()) {
        await copyBtn.click()
        await page.waitForTimeout(400)
        await page.screenshot({
          path: path.join(BASE_OUT, '05_primitives/toast_alerts.png'),
          fullPage: false,
        })
      }
    }
  })
})
