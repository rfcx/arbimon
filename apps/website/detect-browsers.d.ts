declare module 'detect-browsers' {
  type BrowserName = 'Brave Browser' | 'Chromium' | 'Firefox Developer Edition' | 'Firefox Nightly' | 'Firefox' | 'Google Chrome Canary' | 'Google Chrome' | 'Internet Explorer' | 'Microsoft Edge' | 'Opera' | 'Safari Technology Preview' | 'Safari' | 'Vivaldi'

  interface Browser {
    browser: BrowserName
    path: string
  }

  export function getAvailableBrowsers (): Promise<Browser[]>
  export function launchBrowser (browser: Browser, address: string): Promise<void>
}
