import { type AttributeTypes, attributes } from '../type-helpers'

export interface ProjectVersion {
  id: number
  locationProjectId: number
  isPublished: boolean
  isPublic: boolean
}

export const ATTRIBUTES_PROJECT_VERSION = attributes<ProjectVersion>()({
})

export type ProjectVersionTypes = AttributeTypes< ProjectVersion, typeof ATTRIBUTES_PROJECT_VERSION>
