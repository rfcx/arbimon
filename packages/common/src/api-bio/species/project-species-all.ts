import { SpeciesInProjectLight } from '../../dao/types'
import { ProjectSpecificRouteParams } from '../common/project-specific-route'

// Request
export type ProjectSpeciesAllParams = ProjectSpecificRouteParams

export const projectSpeciesAllRoute = '/projects/:projectId/species'

export const projectSpeciesAllUrl = (params: ProjectSpeciesAllParams): string =>
  `/projects/${params.projectId}/species`

// Response

export interface ProjectSpeciesAllResponse {
  species: SpeciesInProjectLight[]
}
