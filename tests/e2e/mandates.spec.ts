import { test, expect } from '@playwright/test'

test.describe('EventMesh Core Mandates & Hardening E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('Mandate 1: Ticket generated intact with QR, tears ONLY upon gate checkin', async ({ page }) => {
    // 1. Navigate to event detail and register
    await page.goto('/events/neural-frontiers-symposium-2026')
    const registerBtn = page.locator('button, a').filter({ hasText: /Register now/i }).first()
    await expect(registerBtn).toBeVisible()
    await registerBtn.click()

    // 2. Stepper Step 1: Your particulars
    await expect(page.locator('h1')).toContainText(/Your particulars/i)
    await page.fill('input#name, input[name="name"]', 'Rhea Chakraborty')
    await page.fill('input#phone, input[name="phone"]', '+91 9123456780')
    await page.getByRole('button', { name: /Continue to Details|Continue to Review/i }).click()

    // Step 2: Custom questionnaire
    await expect(page.locator('h1')).toContainText(/Session questions|Event questionnaire|Review/i)
    const continueToReview = page.getByRole('button', { name: /Continue to Review/i })
    if (await continueToReview.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Fill all visible empty text inputs in questionnaire
      const textInputs = page.locator('input[type="text"]:visible')
      const count = await textInputs.count()
      for (let i = 0; i < count; i++) {
        const val = await textInputs.nth(i).inputValue()
        if (!val) {
          await textInputs.nth(i).fill('Computing Research Lab')
        }
      }
      await continueToReview.click()
    }

    // Step 3: Review & Terms Agreement
    await expect(page.locator('h1')).toContainText(/Review/i)
    const conductCheckbox = page.locator('input#conductAgreement')
    await expect(conductCheckbox).toBeVisible()
    await conductCheckbox.check()

    const confirmBtn = page.getByRole('button', { name: /Confirm & Issue Pass/i })
    await expect(confirmBtn).toBeEnabled()
    await confirmBtn.click()

    // 3. Confirm ticket is generated INTACT with QR on face (zero neon, no torn state yet - Mandate 1)
    await expect(page.getByText(/Registration Confirmed/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Ticket Face Intact/i)).toBeVisible()
    await expect(page.getByText(/Tears only at gate check-in/i)).toBeVisible()
    await expect(page.getByText(/SCAN AT GATE/i)).toBeVisible()

    // Grab ticket code
    const ticketCodeEl = page.locator('span:has-text("TKT-")').first()
    await expect(ticketCodeEl).toBeVisible()
    const ticketCode = (await ticketCodeEl.textContent())?.trim() || 'TKT-884192'

    // 4. Admin gate check-in tears the ticket
    await page.goto('/admin/checkin')
    await expect(page.getByRole('heading', { name: /Venue Gate Check-in/i })).toBeVisible()

    // Submit ticketCode manually in terminal fallback
    const codeInput = page.getByPlaceholder(/E\.g\. TKT-884192/i)
    await expect(codeInput).toBeVisible()
    await codeInput.fill(ticketCode)
    await page.getByRole('button', { name: /Verify Pass/i }).click()

    // 5. Verify Admission success result in admin desk
    await expect(page.getByText(/Admitted & Verified/i)).toBeVisible({ timeout: 5000 })
  })

  test('Mandate 2: Student Lanyard ID Badge in Profile Header with metadata', async ({ page }) => {
    // 1. Visit attendee dashboard
    await page.goto('/attendee/dashboard')

    // 2. Profile header contains student photo and metadata (email, reg number, branch, semester)
    await expect(page.getByText(/CAMPUS IDENTITY/i)).toBeVisible()
    await expect(page.getByText(/VERIFIED PASSHOLDER/i)).toBeVisible()
    await expect(page.getByText(/Sovereign Administrator/i)).toBeVisible()
    await expect(page.getByText(/admin@platform.com/i)).toBeVisible()
    await expect(page.getByText(/21BCE1042/i)).toBeVisible()
    await expect(page.getByText(/Computer Science & Engineering/i)).toBeVisible()
    await expect(page.getByText(/Semester 6/i)).toBeVisible()

    // 3. Verify physical tactile lanyard badge container
    await expect(page.getByText(/OFFICIAL ID BADGE/i)).toBeVisible()
    await expect(page.getByText(/PHYSICS LANYARD/i)).toBeVisible()
    await expect(page.getByRole('button', { name: '3D' })).toBeVisible()
    await expect(page.getByRole('button', { name: '2D' })).toBeVisible()
  })
})
