import { LocationProjectLight } from '../../dao/types'

// Request
export const projectsRoute = '/projects'

// Response
export type LocationProjectForUser =
  LocationProjectLight &
  {
    isMyProject: boolean
    hasPublishedVersions: boolean
    hasPublicVersions: boolean
  }

export type ProjectsResponse = LocationProjectForUser[]
