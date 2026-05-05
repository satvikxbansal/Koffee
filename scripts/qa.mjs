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

const mobile = await newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})

await mobile.goto(baseUrl, { waitUntil: 'domcontentloaded' })
await mobile.waitForTimeout(500)
await mobile.screenshot({
  path: 'screenshots/koffee-playwright-mobile-final-qa.png',
  fullPage: false,
})
await mobile.getByRole('button', { name: 'Share', exact: true }).click()
await mobile.getByRole('button', { name: 'Matcha', exact: true }).click()
await mobile.getByText('Ceremonial Matcha Cloud', { exact: true }).waitFor()
await mobile.getByRole('button', { name: 'Pinned', exact: true }).click()
await mobile.getByRole('button', { name: 'Pin shop', exact: true }).waitFor()
await mobile.getByRole('button', { name: 'Bangalore', exact: true }).click()
await mobile.getByText('Community map', { exact: true }).waitFor()
await mobile.getByText('Strawberry Matcha', { exact: true }).waitFor()
await mobile.getByRole('button', { name: 'Feed', exact: true }).click()
await mobile.getByText('Anaerobic Cappuccino', { exact: true }).waitFor()
await mobile.getByRole('button', { name: 'Add rating', exact: true }).click()
await mobile.getByText('Rate a coffee', { exact: true }).waitFor()
await mobile.getByRole('button', { name: 'Save to Coffee Book', exact: true }).click()
await mobile.getByText('2 ratings in Bangalore', { exact: true }).waitFor()
await mobile.close()

const desktop = await newPage({ viewport: { width: 1280, height: 900 } })
await desktop.goto(baseUrl, { waitUntil: 'domcontentloaded' })
await desktop.waitForTimeout(900)
await desktop.screenshot({
  path: 'screenshots/koffee-playwright-desktop-final-qa.png',
  fullPage: false,
})
await desktop.close()
await browser.close()

if (errors.length > 0) {
  throw new Error(errors.join('\n'))
}

console.log('Koffee QA passed')
