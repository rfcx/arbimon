import { type AttributeTypes, attributes } from '../type-helpers'

export const PROJECT_STATUS_ORDERED = ['hidden', 'unlisted', 'listed', 'published'] as const

export type ProjectStatus = typeof PROJECT_STATUS_ORDERED[number]

export interface Project {
  id: number
  idCore: string
  idArbimon: number
  slug: string
  name: string
  status: ProjectStatus
  statusUpdatedAt: Date
  latitudeNorth: number
  latitudeSouth: number
  longitudeEast: number
  longitudeWest: number
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
  // TODO: Remove the following 4
  summary?: string
  objectives?: string[]
  countries?: string[]
  image?: string
  latitudeAvg?: number
  longitudeAvg?: number
}

export const ATTRIBUTES_LOCATION_PROJECT = attributes<Project>()({
  light: ['id', 'idCore', 'slug', 'name', 'status', 'statusUpdatedAt', 'latitudeNorth', 'latitudeSouth', 'longitudeEast', 'longitudeWest'],
  geo: ['id', 'slug', 'name', 'latitudeAvg', 'longitudeAvg']
})

export type LocationProjectTypes = AttributeTypes<Project, typeof ATTRIBUTES_LOCATION_PROJECT>
