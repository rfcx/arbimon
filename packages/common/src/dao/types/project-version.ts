export interface ProjectVersion {
  id: number
  projectId: number
  isPublished: boolean
  isPublic: boolean
}

export const ATTRIBUTES_PROJECT_VERSION: Record<string, Array<keyof ProjectVersion>> = {}
