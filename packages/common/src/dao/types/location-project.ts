import { attributes, AttributeTypes } from '../type-helpers'

export interface Project {
  id: number
  idCore: string
  idArbimon: number
  slug: string
  slugArbimon: string
  name: string
  latitudeNorth: number
  latitudeSouth: number
  longitudeEast: number
  longitudeWest: number
}

export type LocationProjectLight = Pick<Project,
  'id'| 'idCore' | 'slug'| 'name'| 'latitudeNorth'| 'latitudeSouth'| 'longitudeEast'| 'longitudeWest'
>

export const ATTRIBUTES_LOCATION_PROJECT = attributes<Project>()({
  light: ['id', 'idCore', 'slug', 'name', 'latitudeNorth', 'latitudeSouth', 'longitudeEast', 'longitudeWest']
})
