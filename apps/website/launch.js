import { getAvailableBrowsers, launchBrowser } from 'detect-browsers'

/**
 * If you want to ignore specific browsers, create a file called
 * `launch-config.js` in this folder, for example:
 *
 * ```js
 * export const ignores = [
 *   'Brave Browser',
 *   'Safari'
 * ]
 * ```
 *
 * Browser names are listed in `detect-browsers.d.ts`
 *
 * Warning: If Safari is not your default browser, opening it will *also*
 * open your default browser. This appears to be a bug in Safari:
 * https://developer.apple.com/forums/thread/685385
 */

const SERVE_URL = 'http://localhost:8101'

const main = async () => {
  // Detect browsers
  const ignores = new Set(
    (await import('./launch-config.js').catch(() => ({ ignores: [] })))
      .ignores.map(n => n.toLowerCase())
  )

  const browsers = (await getAvailableBrowsers())
    .filter(({ browser }) => !ignores.has(browser.toLowerCase()))

  // Warn if none found
  if (!browsers.length) {
    console.warn('No browsers detected')
    return
  }

  // Start random browser
  const selectedBrowser = browsers[Math.floor(Math.random() * browsers.length)]
  console.info(`Found ${browsers.length} browsers => launching ${selectedBrowser.browser}`)
  await launchBrowser(selectedBrowser, SERVE_URL)
}

await main()
