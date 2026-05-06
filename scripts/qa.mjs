import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const baseUrl = process.env.QA_BASE_URL ?? 'http://127.0.0.1:5173/'
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const launchOptions = existsSync(chromePath)
  ? { executablePath: chromePath, headless: true }
  : { headless: true }

await mkdir('screenshots', { recursive: true })

const browser = await chromium.launch(launchOptions)
const errors = []

async function newPage(options) {
  const page = await browser.newPage(options)
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return page
}

async function assertNoGutter(page, label) {
  const viewport = page.viewportSize()
  const shellBox = await page.locator('.brew-phone').boundingBox()

  if (!viewport || !shellBox) {
    throw new Error(`${label}: could not measure Brew shell`)
  }

  if (Math.round(shellBox.x) !== 0 || Math.round(shellBox.width) !== viewport.width) {
    throw new Error(
      `${label}: Brew shell has a gutter. x=${shellBox.x}, width=${shellBox.width}, viewport=${viewport.width}`,
    )
  }
}

const mobile = await newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: true,
})

await mobile.goto(baseUrl, { waitUntil: 'domcontentloaded' })
await mobile.locator('.mapboxgl-canvas').waitFor({ state: 'visible' })
await assertNoGutter(mobile, 'mobile discover')
await mobile.waitForTimeout(1800)
await mobile.screenshot({
  path: 'screenshots/brew-mobile-final-qa.png',
  fullPage: false,
})
await mobile
  .getByRole('button', {
    name: 'Blue Tokai - Kamala Mills Lower Parel espresso laptop-friendly',
    exact: true,
  })
  .click()
await mobile.locator('.brew-active-pin').getByText('8.8', { exact: true }).waitFor()
await mobile.getByRole('button', { name: 'Details', exact: true }).click()
await mobile.getByText('Best cups', { exact: true }).waitFor()
await mobile.getByRole('button', { name: 'Back', exact: true }).click()
await mobile.getByRole('button', { name: 'Recenter map', exact: true }).click()
await mobile.getByRole('button', { name: 'Pin cafe', exact: true }).click()
await mobile.getByText('Pin a cafe worth the detour.', { exact: true }).waitFor()
await mobile.getByLabel('Cafe name').fill('Brew Lab Test')
await mobile.getByLabel('Neighborhood or address').fill('Pali Hill')
await mobile.getByRole('button', { name: 'Submit pin', exact: true }).click()
await mobile.getByText('Brew Lab Test', { exact: true }).waitFor()
await mobile.getByRole('button', { name: 'Recenter map', exact: true }).click()
await mobile.getByRole('button', { name: 'Matcha', exact: true }).click()
await mobile.getByText('Subko - Colaba', { exact: true }).waitFor()
await mobile.getByLabel('Search cafes or cities').fill('Bangalore')
await mobile.getByText('Maverick & Farmer', { exact: true }).waitFor()
await mobile.getByRole('button', { name: 'Feed', exact: true }).click()
await mobile.getByText('Microclimate Pour Over', { exact: false }).waitFor()
await mobile.getByRole('button', { name: 'Create Brew activity', exact: true }).click()
await mobile.getByText('New Brew activity', { exact: true }).waitFor()
await mobile.getByLabel('Activity name').fill('Indiranagar tasting lap')
await mobile.getByLabel('Description').fill('Clean finish and good table energy.')
await mobile.getByLabel('What did you order?').fill('Microclimate Pour Over')
await mobile.getByRole('button', { name: "Fine", exact: true }).click()
await mobile.getByRole('button', { name: 'Submit activity', exact: true }).click()
await mobile.getByText('My Brew Book', { exact: true }).waitFor()
await mobile.getByText('Indiranagar tasting lap', { exact: true }).waitFor()
await mobile.close()

const desktop = await newPage({ viewport: { width: 1280, height: 900 } })
await desktop.goto(baseUrl, { waitUntil: 'domcontentloaded' })
await desktop.locator('.mapboxgl-canvas').waitFor({ state: 'visible' })
await assertNoGutter(desktop, 'desktop discover')
await desktop.waitForTimeout(1800)
await desktop.screenshot({
  path: 'screenshots/brew-desktop-final-qa.png',
  fullPage: false,
})
await desktop.close()
await browser.close()

if (errors.length > 0) {
  throw new Error(errors.join('\n'))
}

console.log('Brew QA passed')
