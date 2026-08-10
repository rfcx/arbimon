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

// Phase-C lever (2026-08-04, AUDIT-arbimon-posthog-instrumentation-2026-08-04
// Phase C): staged autocapture rollout. DEFAULT FALSE — flipping it is an
// env/build change only, and the #2461 protocol applies: enable on the demo
// tier first, re-test the visualizer page, THEN prod. Session replay is NOT
// governed by this flag (stays disabled; separate decision — operator Q-B
// 2026-08-04: replay stays OFF).
const POSTHOG_AUTOCAPTURE =
  String(import.meta.env.VITE_POSTHOG_AUTOCAPTURE).toLowerCase() === 'true'

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
      // --- #2461 conservative gate: global listeners OFF unless the Phase-C
      // flag is explicitly set (staged rollout: demo → visualizer retest →
      // prod). Replay stays hard-disabled regardless. ---
      autocapture: POSTHOG_AUTOCAPTURE,
      disable_session_recording: true,
      capture_pageview: false,
      capture_pageleave: POSTHOG_AUTOCAPTURE,
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
 * Canonical id = the user's account EMAIL address (operator decision 2026-07-15),
 * shared across all rfcx clients so a person is one person regardless of app.
 *
 * PERSON PROPERTIES ($set) — why this exists:
 * PostHog's UI does NOT display `distinct_id` when it can avoid it. It renders
 * `team.person_display_name_properties` or, when unset (our case — verified in
 * posthog-postgres), the server default
 * `PERSON_DEFAULT_DISPLAY_NAME_PROPERTIES = ["email", "name", "username"]`
 * (posthog/api/person.py). Without `$set`, NO person carries any of those, so
 * every person in Activity/Explore/Persons renders as a raw id string.
 * Passing the email as distinct_id made that string *look* like an email, but
 * the display layer was never populated. Measured 2026-08-09: 0 of 489 persons
 * across all 3 teams (RFCx/Arbimon/Luca) had email/name/username.
 *
 * `$set` (not `$set_once`) so a name/email change on the account propagates.
 * NORMALISED to lowercase+trimmed to match the distinct_id: PostHog ids are
 * case-sensitive, so an unnormalised variant would split one human into two
 * persons. Only identity fields are sent — no free text, no new PII class
 * (these events are already identified by design; see the 2026-08-04 audit).
 */
export const identify = (user?: User): void => {
  const rawEmail = user?.email
  if (!ready || posthog === undefined || rawEmail === undefined || rawEmail === '') return
  const email = rawEmail.trim().toLowerCase()
  if (email === '') return
  // Build $set defensively: only include keys we actually have, so we never
  // overwrite a populated person property with an empty string.
  //
  // FAILURE MODE (deliberate): the optional DISPLAY fields must never be able
  // to suppress the REQUIRED identity. Auth0 claims are not type-guaranteed
  // (`name`/`nickname` are `unknown`-ish at runtime), so a malformed claim
  // would throw on `.trim()`. If that were inside the same try as identify(),
  // the catch would skip identify() ENTIRELY and we would lose the very
  // attribution this function exists to create — a cosmetic field costing us
  // the person. So property-building is isolated: on any error we degrade to
  // email-only and still identify.
  const props: Record<string, string> = { email }
  try {
    const name = typeof user?.name === 'string' ? user.name.trim() : ''
    if (name !== '') props.name = name
    const username = typeof user?.nickname === 'string' ? user.nickname.trim() : ''
    if (username !== '') props.username = username
  } catch {
    // keep going with email-only — identity matters more than display fields
  }
  try {
    posthog.identify(email, props)
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
