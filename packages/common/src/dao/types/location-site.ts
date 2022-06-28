import { attributes, AttributeTypes } from '../type-helpers'

export interface Site {
  id: number
  idCore: string
  idArbimon: number
  locationProjectId: number
  name: string
  latitude: number
  longitude: number
  altitude: number
}

export const ATTRIBUTES_LOCATION_SITE = attributes<Site>()({
  light: ['id', 'name', 'latitude', 'longitude', 'altitude']
})

export type SiteTypes = AttributeTypes< Site, typeof ATTRIBUTES_LOCATION_SITE>
