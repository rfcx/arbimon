import { AttributeConstants } from '../../type-helpers'

// TODO: Rename this to ProjectSite & update references
export interface Site {
  id: number
  idCore: string
  idArbimon: number
  projectId: number
  projectVersionFirstDetectionId: number
  name: string
  latitude: number
  longitude: number
  altitude: number
}

export const ATTRIBUTES_LOCATION_SITE: AttributeConstants<Site> = {
  light: ['id', 'name', 'latitude', 'longitude', 'altitude'],
  updateOnDuplicate: ['idCore', 'name', 'latitude', 'longitude', 'altitude']
}
