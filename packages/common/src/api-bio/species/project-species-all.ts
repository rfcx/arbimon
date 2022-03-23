import { SpeciesInProjectLight } from '../../dao/types/species-in-project'
import { ProjectSpecificRouteParams } from '../common/project-specific-route'

// Request
export type ProjectSpeciesAllParams = ProjectSpecificRouteParams

export const projectSpeciesAllRoute = '/projects/:projectId/species'

export const projectSpeciesAllGeneratedUrl = (params: ProjectSpeciesAllParams): string =>
  `/projects/${params.projectId}/species`

// Response

export interface ProjectSpeciesAllResponse {
  species: SpeciesInProjectLight[]
}
