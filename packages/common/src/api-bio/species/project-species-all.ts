import { SpeciesInProjectLight } from '../../dao/types/species-in-project'

// Request
export interface ProjectSpeciesAllParams {
  projectId: string
}

export const projectSpeciesAllRoute = '/projects/:projectId/species'

export const projectSpeciesAllGeneratedUrl = (params: ProjectSpeciesAllParams): string =>
  `/projects/${params.projectId}/species`

// Response

export interface ProjectSpeciesAllResponse {
  species: SpeciesInProjectLight[]
}
