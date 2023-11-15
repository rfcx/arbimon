import { type AttributeTypes, attributes } from '../type-helpers'

export const ORGANIZATION_TYPE = ['research-institution', 'non-profit-organization', 'government-organization', 'community-organization', 'individual-contributor'] as const

export const ORGANIZATION_TYPE_NAME: Record<OrganizationType, string> = {
  'research-institution': 'Research institution',
  'non-profit-organization': 'Non-profit organization',
  'government-organization': 'Government organization',
  'community-organization': 'Community organization',
  'individual-contributor': 'Individual contributor'
} as const

export type OrganizationType = typeof ORGANIZATION_TYPE[number]

export interface Organization {
  id: number
  name: string
  type: OrganizationType
  url: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export const ATTRIBUTES_ORGANIZATION = attributes<Organization>()({
  light: ['id', 'name', 'type', 'url', 'image']
})

export type OrganizationTypes = AttributeTypes<Organization, typeof ATTRIBUTES_ORGANIZATION>
