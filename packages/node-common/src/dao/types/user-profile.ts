import { type AttributeTypes, attributes } from '../type-helpers'

export const ACCOUNT_TIER_ORDERED = ['free', 'pro', 'enterprise'] as const
export type AccountTier = typeof ACCOUNT_TIER_ORDERED[number]

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
  createdAt?: Date
  updatedAt?: Date
}

export const ATTRIBUTES_USER = attributes<UserProfile>()({
  light: ['id', 'email', 'firstName', 'lastName', 'image']
})

export type UserTypes = AttributeTypes<UserProfile, typeof ATTRIBUTES_USER>
