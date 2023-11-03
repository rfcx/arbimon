import { type AttributeTypes, attributes } from '../type-helpers'

export interface Site {
  id: number
  idCore: string
  idArbimon: number
  locationProjectId: number
  name: string
  latitude: number
  longitude: number
  altitude: number
  country: string | null
  countryCode: string | null
  createdAt?: Date
  updatedAt?: Date
}

export const ATTRIBUTES_LOCATION_SITE = attributes<Site>()({
  light: ['id', 'idCore', 'name', 'latitude', 'longitude', 'altitude', 'country', 'countryCode']
})

export type SiteTypes = AttributeTypes< Site, typeof ATTRIBUTES_LOCATION_SITE>
