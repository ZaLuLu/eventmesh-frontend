import { test } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 740 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'phone-landscape', width: 844, height: 390 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'wide-1920', width: 1920, height: 1080 },
]

const outDir = path.resolve('tests/visual-snapshots')
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

// Helper to switch to attendee persona for dashboard and 3D lanyard
async function ensureAttendeeSession(page: any) {
  await page.goto('/dev/accounts', { waitUntil: 'networkidle' })
  const switchBtn = page.getByRole('button', { name: /Switch to Aditya Narayan/i })
  if (await switchBtn.isVisible()) {
    await switchBtn.click()
    await page.waitForTimeout(800)
  }
  await page.goto('/attendee/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
}

test.describe('Comprehensive Visual Auditing Suite', () => {

  // =========================================================================
  // 1. DEDICATED FEATURE AUDIT: TICKETS SECTION & TACTILE TICKET TEAR
  // =========================================================================
  test('Dedicated Feature: Tickets Section & Tactile Ticket Tear (Desktop 1440)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // A. Tickets Section on Home (#admission)
    const admissionSection = page.locator('#admission')
    await admissionSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(600)
    await admissionSection.screenshot({
      path: path.join(outDir, 'feature-01-tickets-admission-section.png'),
    })

    // B. Click "Preview Tactile Pass"
    const previewBtn = page.getByRole('button', { name: /Preview Tactile Pass/i })
    await previewBtn.click()
    await page.waitForTimeout(800)

    // Locate the full demonstration panel containing the ticket
    const demoPanel = page.locator('text=TACTILE DIGITAL PASS DEMONSTRATION').locator('xpath=ancestor::div[contains(@class, "bg-[#F8FAFC]")]').first()
    await demoPanel.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Capture intact ticket with stub #01, barcode, OTP code slots
    await demoPanel.screenshot({
      path: path.join(outDir, 'feature-02-ticket-tactile-intact.png'),
    })

    // C. Click the Gate Stub to simulate physical tear
    const gateStub = page.getByText('GATE STUB').first()
    await gateStub.click()
    // Wait for the paper tear animation, severed perforation, chime, and ADMITTED state
    await page.waitForTimeout(1600)

    // Capture torn ticket showing severed perforation and ADMITTED status
    await demoPanel.screenshot({
      path: path.join(outDir, 'feature-03-ticket-tactile-torn.png'),
    })
  })

  // =========================================================================
  // 2. DEDICATED FEATURE AUDIT: 3D STUDENT ID LANYARD & ATTENDEE PASSES
  // =========================================================================
  test('Dedicated Feature: 3D Student ID Lanyard & Attendee Passes (Desktop 1440)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await ensureAttendeeSession(page)
    await page.waitForTimeout(2000) // Allow Three.js WebGL canvas & textures to initialize

    // A. Focused 3D Lanyard Stage
    const lanyardCol = page.locator('.lg\\:col-span-5').first()
    await lanyardCol.scrollIntoViewIfNeeded()
    await page.waitForTimeout(600)
    await lanyardCol.screenshot({
      path: path.join(outDir, 'feature-04-lanyard-3d-credential.png'),
    })

    // B. Double-Sided Tactile Boarding Passes Grid
    const passesSection = page.locator('div:has-text("My tickets")').locator('xpath=ancestor::div[contains(@class, "app-container")]').last()
    await passesSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await passesSection.screenshot({
      path: path.join(outDir, 'feature-05-tactile-boarding-passes-grid.png'),
    })

    // C. Inspect pass in floating modal
    const presentBtn = page.getByRole('button', { name: /Present Pass/i }).first()
    if (await presentBtn.isVisible()) {
      await presentBtn.click()
      await page.waitForTimeout(1000)

      await page.screenshot({
        path: path.join(outDir, 'feature-06-floating-ticket-modal-intact.png'),
      })

      // Click floating stub to tear
      const floatingStub = page.locator('div:has-text("GATE STUB")').last()
      if (await floatingStub.isVisible()) {
        await floatingStub.click()
        await page.waitForTimeout(1600)
        await page.screenshot({
          path: path.join(outDir, 'feature-07-floating-ticket-modal-torn.png'),
        })
      }
    }
  })

  // =========================================================================
  // 3. FULL-PAGE COMPREHENSIVE SUITE (Desktop 1440px)
  // =========================================================================
  test('Full-Page Complete Website Audit (Desktop 1440px)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    // Home Page (full height)
    await page.goto('/', { waitUntil: 'networkidle' })
    // Ensure the ticket preview is open in the full page screenshot too!
    const previewBtn = page.getByRole('button', { name: /Preview Tactile Pass/i })
    if (await previewBtn.isVisible()) {
      await previewBtn.click()
      await page.waitForTimeout(500)
    }
    await page.waitForTimeout(1000)
    await page.screenshot({ path: path.join(outDir, 'fullpage-01-home.png'), fullPage: true })

    // Explore
    await page.goto('/explore', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outDir, 'fullpage-02-explore.png'), fullPage: true })

    // Calendar
    await page.goto('/calendar', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outDir, 'fullpage-03-calendar.png'), fullPage: true })

    // Clubs
    await page.goto('/clubs', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outDir, 'fullpage-04-clubs.png'), fullPage: true })

    // Announcements
    await page.goto('/announcements', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outDir, 'fullpage-05-announcements.png'), fullPage: true })

    // Flagship Event Detail
    await page.goto('/events/grand-turing-hackathon-2026', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outDir, 'fullpage-06-event-detail.png'), fullPage: true })

    // Event Registration with Ticket Tiers
    await page.goto('/events/grand-turing-hackathon-2026/register', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outDir, 'fullpage-07-event-register.png'), fullPage: true })

    // Attendee Dashboard (Full page with 3D Lanyard and Boarding Passes)
    await ensureAttendeeSession(page)
    await page.waitForTimeout(1800)
    await page.screenshot({ path: path.join(outDir, 'fullpage-08-dashboard-lanyard.png'), fullPage: true })

    // Styleguide
    await page.goto('/styleguide', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outDir, 'fullpage-09-styleguide.png'), fullPage: true })

    // Admin Console
    await page.goto('/admin', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outDir, 'fullpage-10-admin-console.png'), fullPage: true })

    // Admin Check-in Terminal
    await page.goto('/admin/checkin', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outDir, 'fullpage-11-admin-checkin.png'), fullPage: true })
  })

  // =========================================================================
  // 4. MULTI-DEVICE VIEWPORT MATRIX (8 Screen Breakpoints)
  // =========================================================================
  for (const vp of VIEWPORTS) {
    test(`Viewport Matrix: ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })

      // A. Home with open Ticket Preview
      await page.goto('/', { waitUntil: 'networkidle' })
      const previewBtn = page.getByRole('button', { name: /Preview Tactile Pass/i })
      if (await previewBtn.isVisible()) {
        await previewBtn.click()
        await page.waitForTimeout(500)
      }
      await page.waitForTimeout(600)
      await page.screenshot({
        path: path.join(outDir, `${vp.name}-home.png`),
      })

      // B. Tickets Section Focused Snapshot
      const admissionSection = page.locator('#admission')
      if (await admissionSection.isVisible()) {
        await admissionSection.scrollIntoViewIfNeeded()
        await page.waitForTimeout(500)
        await admissionSection.screenshot({
          path: path.join(outDir, `${vp.name}-admission-tickets.png`),
        })
      }

      // C. Attendee Dashboard with 3D Lanyard
      await ensureAttendeeSession(page)
      await page.waitForTimeout(1500)
      await page.screenshot({
        path: path.join(outDir, `${vp.name}-dashboard-lanyard.png`),
      })

      // D. Explore
      await page.goto('/explore', { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await page.screenshot({
        path: path.join(outDir, `${vp.name}-explore.png`),
      })

      // E. Styleguide
      await page.goto('/styleguide', { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await page.screenshot({
        path: path.join(outDir, `${vp.name}-styleguide.png`),
      })

      // F. Admin
      await page.goto('/admin', { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await page.screenshot({
        path: path.join(outDir, `${vp.name}-admin.png`),
      })
    })
  }
})
