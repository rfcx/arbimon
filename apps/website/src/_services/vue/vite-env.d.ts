import 'vite/client'

declare global {
  interface ImportMetaEnv extends Readonly<Record<string, string>> {
    readonly VITE_APP_NAME: string
    readonly VITE_ARBIMON_LEGACY_BASE_URL: string
    readonly VITE_API_BASE_URL: string
    readonly VITE_CORE_API_BASE_URL: string
    readonly VITE_GA_MEASUREMENT_ID: string
    readonly VITE_POSTHOG_ENABLED: string
    readonly VITE_POSTHOG_KEY: string
    readonly VITE_POSTHOG_HOST: string
    readonly VITE_RELEASE_COMMIT: string
    readonly VITE_RELEASE_DATE: string
  }
}
