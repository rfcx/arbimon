import { Project } from '../../dao/types'

// Request
export const projectsRoute = '/projects'

// Response
type ApiProjectLight = Pick<Project, 'id'| 'slug'| 'name'| 'latitudeNorth'| 'latitudeSouth'| 'longitudeEast'| 'longitudeWest'>

export type ProjectsResponse = ApiProjectLight[]
