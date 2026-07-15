import { type User } from '@auth0/auth0-spa-js'
import { type PostHog } from 'posthog-js'
import { type Router } from 'vue-router'

/**
 * Analytics adapter (PostHog).
 *
 * Replaces the previous Google Analytics (`vue-gtag`) integration, which was
 * DISABLED while investigating the visualizer-page hang (rfcx/arbimon#2461) and
 * is now removed entirely (GA `UA-38186431-11` / `G-30S3SHR2JZ` / `G-RJJTZ45WJB`
 * + GTM `GTM-5M6JKHVW` are decommissioned).
 *
 * Analytics is now self-hosted PostHog (track.arbimon.org -> in-cluster
 * PostHog). This module is a THIN, vendor-isolated seam so the rest of the app
 * calls `track()` / `identify()` without importing a vendor SDK directly, and
 * so instrumentation can be toggled with a single env flag.
 *
 * CONSERVATIVE by design (the #2461 gate): initialised with
 *   - autocapture: false        (no global DOM/scroll/click listeners)
 *   - disable_session_recording: true
 *   - capture_pageview: false   (we send MANUAL pageviews on router.afterEach)
 * so it does NOT reproduce the GTM-style global listeners + setTimeout chains
 * suspected in #2461. Only after the visualizer page is validated under this
 * conservative config should autocapture / session replay be enabled (staged,
 * re-testing that page at each step).
 *
 * SSR: posthog-js is a browser-only library. `initAnalytics` MUST be called
 * client-side only (guard with `import.meta.env.SSR` / `isClient`).
 */

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST
// Env-gate the whole integration so it can be turned on/off without a code
// change. Defaults OFF unless explicitly enabled AND a key is present.
const POSTHOG_ENABLED =
  String(import.meta.env.VITE_POSTHOG_ENABLED).toLowerCase() === 'true' &&
  typeof POSTHOG_KEY === 'string' &&
  POSTHOG_KEY.length > 0

// Lazily-loaded posthog-js instance (only imported in the browser when enabled).
let posthog: PostHog | undefined
let ready = false

export const isAnalyticsEnabled = (): boolean => POSTHOG_ENABLED

/**
 * Initialise PostHog (client-side only) and wire manual pageview capture.
 * No-op when disabled, on the server, or if already initialised.
 */
export const initAnalytics = async (router?: Router): Promise<void> => {
  if (!POSTHOG_ENABLED || import.meta.env.SSR || ready) return
  try {
    const mod = await import('posthog-js')
    posthog = mod.default
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // --- #2461 conservative gate: keep global listeners OFF for now ---
      autocapture: false,
      disable_session_recording: true,
      capture_pageview: false,
      capture_pageleave: false,
      // First-party host; no third-party cookies needed.
      persistence: 'localStorage+cookie',
      // We don't use PostHog feature flags / surveys here, so disable the
      // /flags (decide) external call entirely. This keeps the page-load path
      // minimal (one fewer network request + no flag polling) — aligned with
      // the #2461 conservative gate. Event capture is unaffected.
      advanced_disable_flags: true
    })
    ready = true

    // Manual pageviews (SPA) — mirrors the old GA pageTracker behaviour without
    // GTM's global scroll/page_view listeners.
    if (router !== undefined) {
      router.afterEach((to) => {
        capture('$pageview', { path: to.fullPath, name: String(to.name ?? '') })
      })
    }
  } catch (err) {
    // Never let analytics break app boot.
    // eslint-disable-next-line no-console
    console.warn('[analytics] PostHog init failed; continuing without analytics', err)
  }
}

const capture = (eventName: string, properties?: Record<string, unknown>): void => {
  if (!ready || posthog === undefined) return
  try {
    posthog.capture(eventName, properties)
  } catch {
    // swallow — analytics must never throw into app code
  }
}

/**
 * Track a product event. Drop-in replacement for the old `vue-gtag` `event()`
 * at existing call sites (same (name, props) shape).
 */
export const track = (eventName: string, properties?: Record<string, unknown>): void => {
  capture(eventName, properties)
}

/**
 * Associate the current anonymous session with a stable person on login.
 * Canonical id = Auth0 `sub` (the operator-agreed cross-client identity key),
 * which the API resolves back to the internal user/profile. No PII in props.
 */
export const identify = (user?: User): void => {
  if (!ready || posthog === undefined || user?.sub === undefined) return
  try {
    posthog.identify(user.sub)
  } catch {
    // swallow
  }
}

/** Clear identity on logout (call from the logout flow when wired). */
export const resetAnalytics = (): void => {
  if (!ready || posthog === undefined) return
  try {
    posthog.reset()
  } catch {
    // swallow
  }
}
