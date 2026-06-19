import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ezra-language', 'en'))
  await page.goto('/')
})

test('public gallery loads, scrolls, and navigates', async ({ page }) => {
  await expect(page).toHaveTitle(/Ezra/)
  await expect(page.getByRole('heading', { name: 'Our little fighter' })).toBeVisible()
  await expect(page.getByAltText('Ezra looking around from his NICU bed')).toBeVisible()

  await page.mouse.wheel(0, 650)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  await page.getByRole('button', { name: 'Care' }).click()
  await expect(page.getByRole('heading', { name: 'Care, when it’s helpful' })).toBeVisible()
})

test('authentication modal opens while photos remain public', async ({ page }) => {
  test.skip(!process.env.VITE_SUPABASE_URL, 'Supabase environment is required for authentication UI')
  const signIn = page.getByRole('button', { name: 'Sign in' })
  await expect(signIn).toBeVisible()
  await signIn.click()
  await expect(page.getByRole('dialog', { name: 'Family sign in' })).toBeVisible()
  await expect(page.getByText('Photos remain public. Sign in only to save and sync updates.')).toBeVisible()
})
