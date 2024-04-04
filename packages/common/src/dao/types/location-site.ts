import { type AttributeTypes, attributes } from '../type-helpers'

export interface Site {
  id: number
  idCore: string
  idArbimon: number
  locationProjectId: number
  name: string
  latitude?: number
  longitude?: number
  altitude?: number
  countryCode?: string
  createdAt?: Date
  updatedAt?: Date
  hidden?: boolean
}

export type MapableSite = Required<Pick<Site, 'latitude' | 'longitude'>> & Omit<Site, 'latitude' | 'longitude'>

export const ATTRIBUTES_LOCATION_SITE = attributes<Site>()({
  light: ['id', 'idCore', 'name', 'latitude', 'longitude', 'altitude', 'countryCode']
})

export type SiteTypes = AttributeTypes<Site, typeof ATTRIBUTES_LOCATION_SITE>
