/**
 * Pure entitlement logic (no Vue / no store deps) — unit-testable in isolation.
 * See ~/access for the reactive composable + the higher-level docs.
 */

/** Feature keys under allow-list control. Add new gated features here. */
export type GatedFeature =
  | 'analysisJobsTray'

/** Per-feature allow-lists (emails and/or @domains, case-insensitive). */
const ACCESS_LISTS: Record<GatedFeature, string[]> = {
  analysisJobsTray: [
    'topher@rfcx.org',
    'arbimon-admin@rfcx.org',
    'support@rfcx.org'
  ]
}

/** Identities that receive EVERY gated feature (ops/admin break-glass). */
const SUPER_ACCESS: string[] = [
  'arbimon-admin@rfcx.org'
]

const matches = (entry: string, email: string): boolean => {
  const e = entry.trim().toLowerCase()
  if (e === '') return false
  if (e.startsWith('@')) return email.endsWith(e)
  return email === e
}

/** Pure entitlement check. Unknown/empty email → no access. */
export const hasFeatureAccess = (feature: GatedFeature, email: string | undefined | null): boolean => {
  if (email === undefined || email === null || email === '') return false
  const normalized = email.trim().toLowerCase()
  if (SUPER_ACCESS.some(entry => matches(entry, normalized))) return true
  return (ACCESS_LISTS[feature] ?? []).some(entry => matches(entry, normalized))
}
