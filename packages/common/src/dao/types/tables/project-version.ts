import { AttributeConstants } from '../../type-helpers'

export interface ProjectVersion {
  id: number
  projectId: number
  isPublished: boolean
  isPublic: boolean
}

export const ATTRIBUTES_PROJECT_VERSION: AttributeConstants<ProjectVersion> = {}
