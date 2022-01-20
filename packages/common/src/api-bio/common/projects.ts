// Request
export const projectsRoute = '/projects'

// Response
export type ProjectsResponse = Project[]

// Models
export interface Project {
  id: string
  name: string
  isPublic: boolean
  externalId: number
  geoBounds: [
    { lon: number, lat: number },
    { lon: number, lat: number }
  ]
}
