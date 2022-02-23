import { ProjectSpeciesAllParams, ProjectSpeciesAllResponse } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SPECIES_IN_PROJECT_ATTRIBUTES } from '@rfcx-bio/common/dao/models/species-in-project-model'

import { Handler } from '../_services/api-helpers/types'
import { getSequelize } from '../_services/db'
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
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const species = await models.SpeciesInProject.findAll({
    where: { locationProjectId: projectId },
    order: [['scientificName', 'ASC']],
    attributes: SPECIES_IN_PROJECT_ATTRIBUTES.light
  })

  return { species }
}
