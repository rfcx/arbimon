import { type ProjectSpeciesAllParams, type ProjectSpeciesAllResponse, type ProjectSpeciesLightResponse, type ProjectSpeciesQueryParams } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_SPECIES_IN_PROJECT } from '@rfcx-bio/common/dao/types/species-in-project'

import { BioInvalidPathParamError } from '~/errors'
import { type Handler } from '../_services/api-helpers/types'
import { getSequelize } from '../_services/db'
import { assertPathParamsExist } from '../_services/validation'

export const projectSpeciesLightHandler: Handler<ProjectSpeciesLightResponse, ProjectSpeciesAllParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  // Query
  const response: ProjectSpeciesLightResponse = await getProjectSpeciesLight(Number(projectId))

  // Response
  return response
}

export const projectSpeciesAllHandler: Handler<ProjectSpeciesAllResponse, ProjectSpeciesAllParams, ProjectSpeciesQueryParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const speciesInProject = await getProjectSpeciesAll(projectIdInteger, req.query)

  return {
    ...speciesInProject
  }
}

export async function getProjectSpeciesLight (projectId: number): Promise<ProjectSpeciesLightResponse> {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const species = await models.SpeciesInProject.findAll({
    where: { locationProjectId: projectId },
    attributes: ATTRIBUTES_SPECIES_IN_PROJECT.light,
    order: [['scientificName', 'ASC']]
  })

  return { species }
}

export const getProjectSpeciesAll = async (locationProjectId: number, params: ProjectSpeciesQueryParams): Promise<ProjectSpeciesAllResponse> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .SpeciesInProject
    .findAll({
      where: { locationProjectId },
      order: [['scientificName', 'ASC']],
      limit: params.limit,
      offset: params.offset,
      raw: true
    })

  const res = result.map(({ taxonSpeciesSlug, taxonClassSlug, scientificName, commonName, riskRatingId, photoUrl }) => ({
    slug: taxonSpeciesSlug,
    taxonSlug: taxonClassSlug,
    scientificName,
    commonName,
    riskId: riskRatingId,
    photoUrl
  }))
  return { species: res }
}
