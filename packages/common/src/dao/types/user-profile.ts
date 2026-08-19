import { type AttributeTypes, attributes } from '../type-helpers'

export const ACCOUNT_TIER_ORDERED = ['free', 'pro'] as const
export type AccountTier = typeof ACCOUNT_TIER_ORDERED[number]

/**
 * A user-defined filename timestamp format, saved to their global profile so it
 * applies to every project and upload session (and every device).
 *
 * `format` is a %-token string in the same vocabulary the upload engine parses
 * (`FORMAT_TOKENS` in `@rfcx-bio/upload-engine`), e.g. `%Y%M%D_%H%I%S`.
 * `label` is what the user sees in a list; the raw token string is unreadable.
 */
export interface UserTimestampFormat {
  /** Stable client-generated id, so a list edit can target one entry. */
  id: string
  /** Human name, e.g. 'AudioMoth field kit'. Required — see above. */
  label: string
  /** The %-token format string. */
  format: string
  /** ISO-8601. Informational; ordering is by array position, not by date. */
  createdAt: string
}

/**
 * Upper bound on saved formats per user. Guards the JSON column against a
 * runaway client, and a list longer than this is a sign the feature is being
 * misused rather than a real workflow.
 */
export const MAX_USER_TIMESTAMP_FORMATS = 20

export interface UserProfile {
  id: number
  email: string // idCore + idArbimon
  idAuth0?: string
  firstName: string
  lastName: string
  image?: string
  organizationIdAffiliated?: number
  accountTier?: AccountTier
  accountTierUpdatedAt?: Date
  additionalPremiumProjectSlots?: number
  /**
   * Saved custom filename formats, ORDER-SIGNIFICANT: these augment (never
   * replace) the engine's auto-detection, and the first entry that matches a
   * filename wins (operator decision, 2026-08-18).
   */
  timestampFormats?: UserTimestampFormat[]
  createdAt?: Date
  updatedAt?: Date
}

export const ATTRIBUTES_USER = attributes<UserProfile>()({
  light: ['id', 'email', 'firstName', 'lastName', 'image']
})

export type UserTypes = AttributeTypes<UserProfile, typeof ATTRIBUTES_USER>
