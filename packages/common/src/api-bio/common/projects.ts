// Request
export const projectsRoute = '/projects'

// Response
export type ProjectsResponse = Project[]

// Models
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
}
