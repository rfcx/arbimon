import 'vite/client'

declare global {
  interface ImportMetaEnv extends Readonly<Record<string, string>> {
    readonly VITE_APP_NAME: string
    readonly VITE_ARBIMON_BASE_URL: string
    readonly VITE_BIO_API_BASE_URL: string
    readonly VITE_CORE_API_BASE_URL: string
    readonly VITE_GA_MEASUREMENT_ID: string
    readonly VITE_RELEASE_COMMIT: string
    readonly VITE_RELEASE_DATE: string
  }
}
