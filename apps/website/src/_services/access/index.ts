/**
 * Access control — per-user feature entitlements (allow-list gating).
 *
 * The reusable way to limit a feature to specific users. Declare a feature
 * key + its allow-list in `./entitlements`; gate UI with `useFeatureAccess(key)`
 * (reactive) or `hasFeatureAccess(key, email)` (pure). Task-tray sources gate
 * via their `requiresFeature` field, which the tray stack enforces centrally.
 *
 * ┌─ IMPORTANT: this is VISIBILITY gating, not authorization. It hides UI in
 * │  the browser; it CANNOT stop a determined user from calling an API they
 * │  are already authorized for. Only gate features here where that's
 * │  acceptable (e.g. beta UI over data the user can already access).
 * └─ Anything privileged MUST be enforced server-side (biodiversity-api has
 *    SUPER_USER_EMAILS for that).
 *
 * Allow-list entries are matched case-insensitively and may be either a full
 * email ("topher@rfcx.org") or a domain ("@rfcx.org", grants everyone there).
 *
 * SOURCING: the lists are declared in-code today (a change needs a deploy).
 * The call sites (hasFeatureAccess / useFeatureAccess / requiresFeature) are
 * a stable seam — the list SOURCE can later move to env, a remote config
 * endpoint, or PostHog flags without touching any consumer.
 */
import { type ComputedRef, computed } from 'vue'

import { useStore } from '~/store'
import { type GatedFeature, hasFeatureAccess } from './entitlements'

export type { GatedFeature } from './entitlements'
export { hasFeatureAccess } from './entitlements'

/** Reactive entitlement check bound to the current signed-in user. */
export const useFeatureAccess = (feature: GatedFeature): ComputedRef<boolean> => {
  const store = useStore()
  return computed(() => hasFeatureAccess(feature, store.user?.email))
}
