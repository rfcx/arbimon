import { type AttributeTypes, attributes } from '../type-helpers'

export const ORGANIZATION_TYPE = ['research-institution', 'non-profit-organization', 'government-organization', 'private-organization', 'community-organization'] as const

export const ORGANIZATION_TYPE_NAME: Record<OrganizationType, string> = {
  'research-institution': 'Research institution',
  'non-profit-organization': 'Non-profit organization',
  'government-organization': 'Government organization',
  'private-organization': 'Private organization',
  'community-organization': 'Community organization'
} as const

export type OrganizationType = typeof ORGANIZATION_TYPE[number]

export interface Organization {
  id: number
  name: string
  type: OrganizationType
  url: string
  image?: string
  createdAt?: Date
  updatedAt?: Date
}

export const ATTRIBUTES_ORGANIZATION = attributes<Organization>()({
  light: ['id', 'name', 'type', 'url', 'image']
})

export type OrganizationTypes = AttributeTypes<Organization, typeof ATTRIBUTES_ORGANIZATION>
