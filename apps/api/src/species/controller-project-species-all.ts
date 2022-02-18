import { ProjectSpeciesAllParams, ProjectSpeciesAllResponse } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { rawSpecies } from '@rfcx-bio/common/mock-data'

import { Handler } from '../_services/api-helpers/types'
import { assertPathParamsExist } from '../_services/validation'

export const projectSpeciesAllHandler: Handler<ProjectSpeciesAllResponse, ProjectSpeciesAllParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  // Query
  const response: ProjectSpeciesAllResponse = await getProjectSpeciesAll(Number(projectId))

  // Response
  return response
}

export async function getProjectSpeciesAll (projectId: number): Promise<ProjectSpeciesAllResponse> {
  return {
    species: rawSpecies.map(({ speciesId, speciesSlug, scientificName, commonName, taxon }) =>
      ({ speciesId, speciesSlug, scientificName, commonName, taxon }))
  }
}
