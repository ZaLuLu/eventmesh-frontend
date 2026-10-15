import { expect, test } from '@playwright/test'

// Run against the local mock frontend, never a live service.
test.describe('redesign foundations', () => {
  test('starts light, keeps explicit dark choice and keeps admin aliases consistent', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/admin')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    const colors = await page.locator('.admin-scope').evaluate((element) => {
      const css = getComputedStyle(element)
      return [css.getPropertyValue('--paper').trim(), css.getPropertyValue('--color-canvas').trim()]
    })
    expect(colors[0]).toBe(colors[1])
    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('mobile navigation traps focus and returns it on Escape', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 })
    await page.goto('/admin')
    const trigger = page.getByRole('button', { name: 'Open sidebar' })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Navigation' })
    await expect(dialog).toBeVisible()
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press('Tab')
      expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
  })

  test('filters are named and return focus; demo registration is absent', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 })
    await page.goto('/explore')
    const trigger = page.getByRole('button', { name: 'Filters', exact: true })
    await trigger.click()
    await expect(page.getByRole('dialog', { name: 'Event filters' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
    for (const path of ['/', '/events/neural-frontiers-symposium-2026', '/events/neural-frontiers-symposium-2026/register']) {
      await page.goto(path)
      await expect(page.getByText(/1-Tap/)).toHaveCount(0)
    }
  })

  test('wallet keeps the 3D experience mounted', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 })
    await page.goto('/attendee/dashboard')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20000 })
  })
})
