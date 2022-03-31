import { ProjectLight } from '../../dao/types'

// Request
export const projectsRoute = '/projects'

// Response
export type ProjectForUser =
  ProjectLight &
  {
    isMyProject: boolean
    hasPublishedVersions: boolean
    hasPublicVersions: boolean
  }

export type ProjectsResponse = ProjectForUser[]
