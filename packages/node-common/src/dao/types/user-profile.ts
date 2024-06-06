import { type AttributeTypes, attributes } from '../type-helpers'

export interface UserProfile {
  id: number
  email: string // idCore + idArbimon
  idAuth0?: string
  firstName: string
  lastName: string
  image?: string
  organizationIdAffiliated?: number
  createdAt?: Date
  updatedAt?: Date
}

export const ATTRIBUTES_USER = attributes<UserProfile>()({
  light: ['id', 'email', 'firstName', 'lastName', 'image']
})

export type UserTypes = AttributeTypes<UserProfile, typeof ATTRIBUTES_USER>
