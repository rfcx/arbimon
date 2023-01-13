import { attributes, AttributeTypes } from '../type-helpers'

export interface Project {
  id: number
  idCore: string
  idArbimon: number
  slug: string
  name: string
  latitudeNorth: number
  latitudeSouth: number
  longitudeEast: number
  longitudeWest: number
  createdAt?: Date
  updatedAt?: Date
}

export const ATTRIBUTES_LOCATION_PROJECT = attributes<Project>()({
  light: ['id', 'idCore', 'slug', 'name', 'latitudeNorth', 'latitudeSouth', 'longitudeEast', 'longitudeWest']
})

export type LocationProjectTypes = AttributeTypes<Project, typeof ATTRIBUTES_LOCATION_PROJECT>
