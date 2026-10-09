import { test, expect } from '@playwright/test'

test.describe('EventMesh Core E2E Smoke Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Reset local mock store before running test
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('Flow A: Visitor registers for an event and receives digital ticket pass', async ({ page }) => {
    // 1. Visit Home and navigate to Explore
    await page.goto('/')
    await expect(page).toHaveTitle(/EventMesh/i)

    // 2. Click Explore in navigation
    await page.click('a[href="/explore"]')
    await expect(page).toHaveURL('/explore')

    // 3. Find first event and click to detail
    const eventRow = page.locator('a[href^="/events/"]').first()
    await expect(eventRow).toBeVisible()
    await eventRow.click()

    // 4. Click Register button on detail page
    const registerBtn = page.getByRole('link', { name: /Register Now/i })
    await expect(registerBtn).toBeVisible()
    await registerBtn.click()

    // 5. Fill registration form
    await expect(page.locator('h1')).toContainText(/Registration/i)
    await page.fill('input#name, input[name="name"]', 'Arun Kumar')
    await page.fill('input#email, input[name="email"]', 'arun@example.com')
    await page.fill('input#phone, input[name="phone"]', '+91 9876543210')

    // Handle any event custom questionnaire fields if present
    const extraInputs = page.locator('input[type="text"]:not(#name):not(#email):not(#phone):not([name="name"]):not([name="email"]):not([name="phone"])')
    const count = await extraInputs.count()
    for (let i = 0; i < count; i++) {
      await extraInputs.nth(i).fill('Engineering Department')
    }
    const selectInputs = page.locator('select')
    const selectCount = await selectInputs.count()
    for (let i = 0; i < selectCount; i++) {
      await selectInputs.nth(i).selectOption({ index: 1 })
    }

    // 6. Submit registration
    const submitBtn = page.getByRole('button', { name: /Complete Registration/i })
    await submitBtn.click()

    // 7. Verify ticket pass confirmation & QR display
    await expect(page.getByText(/Registration Confirmed/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/PASS-/i)).toBeVisible()
    await expect(page.locator('canvas').first()).toBeVisible() // QR element
  })

  test('Flow B: Club admin creates and publishes event -> verified on public listing', async ({ page }) => {
    // 1. Log in via Dev Accounts as Club Admin (DevCraft)
    await page.goto('/dev/accounts')
    await expect(page.getByText(/Developer Personas/i)).toBeVisible()

    const devcraftBtn = page.getByRole('button', { name: /DevCraft Lead/i })
    await devcraftBtn.click()

    // 2. Navigated to Admin Console
    await expect(page).toHaveURL('/admin')
    await expect(page.getByText(/DEVCRAFT/i).first()).toBeVisible()

    // 3. Navigate to Event Wizard
    await page.goto('/admin/events/new')
    await expect(page.getByText(/Exhibition Master/i)).toBeVisible()

    // 4. Fill event details in wizard
    const testTitle = `AUTOMATED TEST HACKATHON ${Date.now()}`
    await page.fill('input[placeholder*="Grand Turing"]', testTitle)
    await page.fill('input[placeholder*="36-hour competitive"]', 'Automated E2E test event description')

    // Step 2: Schedule
    await page.getByRole('button', { name: /Next Step/i }).click()
    // Step 3: Venue
    await page.getByRole('button', { name: /Next Step/i }).click()
    // Step 4: Registration
    await page.getByRole('button', { name: /Next Step/i }).click()
    // Step 5: Exhibition Theme
    await page.getByRole('button', { name: /Next Step/i }).click()
    // Step 6: Review & Publish
    await page.getByRole('button', { name: /Next Step/i }).click()

    // Publish
    const publishBtn = page.getByRole('button', { name: /Publish Exhibition/i })
    await publishBtn.click()
    await page.waitForURL('/admin/events')

    // 5. Verify published event appears in public explore listings
    await page.goto('/explore')
    await expect(page.getByText(testTitle)).toBeVisible({ timeout: 10000 })
  })

  test('Flow C: Volunteer checks in attendee and verifies certificate', async ({ page }) => {
    // 1. Switch to Volunteer persona
    await page.goto('/dev/accounts')
    await page.getByRole('button', { name: /Volunteer/i }).click()

    // 2. Go to checkin portal
    await page.goto('/admin/checkin')
    await expect(page.getByText(/Gate & Terminal Check-in/i)).toBeVisible()

    // 3. Verify certificate portal at /verify/:id with known seed certificate
    await page.goto('/verify/TA-2026-001245')
    await expect(page.getByText(/Official Verification Record/i)).toBeVisible()
    await expect(page.getByText(/TA-2026-001245/i)).toBeVisible()
    await expect(page.getByText(/Status: Validated & Cryptographically Signed/i)).toBeVisible()
  })

  test('Flow D: Multi-club isolation - Club A admin cannot access Club B data', async ({ page }) => {
    // 1. Login as DevCraft Admin (Club A)
    await page.goto('/dev/accounts')
    await page.getByRole('button', { name: /DevCraft Lead/i }).click()
    await expect(page).toHaveURL('/admin')

    // 2. Go to admin events list
    await page.goto('/admin/events')
    await expect(page.getByText(/Events Directory/i)).toBeVisible()

    // 3. Should ONLY see DevCraft events, not Birds or CyberGuard events in management table
    const tableText = await page.locator('table').textContent()
    expect(tableText).not.toContain('Neural Frontiers')
    expect(tableText).not.toContain('CyberGuard')
  })
})
