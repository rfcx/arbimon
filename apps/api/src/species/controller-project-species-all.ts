import {
  type ProjectSpeciesParams,
  type ProjectSpeciesQueryParams,
  type ProjectSpeciesResponse
} from '@rfcx-bio/common/api-bio/species/project-species-all'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_SPECIES_IN_PROJECT } from '@rfcx-bio/common/dao/types/species-in-project'

import { BioInvalidPathParamError, BioInvalidQueryParamError } from '~/errors'
import { type Handler } from '../_services/api-helpers/types'
import { getSequelize } from '../_services/db'
import { assertPathParamsExist } from '../_services/validation'

export const projectSpeciesHandler: Handler<ProjectSpeciesResponse, ProjectSpeciesParams, ProjectSpeciesQueryParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const speciesInProject = await getProjectSpecies(projectIdInteger, req.query)

  return {
    ...speciesInProject
  }
}

export const getProjectSpecies = async (locationProjectId: number, params: ProjectSpeciesQueryParams): Promise<ProjectSpeciesResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)
  const { limit = 100, offset = 0, fields = 'light' } = params
  const attributes = ATTRIBUTES_SPECIES_IN_PROJECT[fields]

  if (attributes === undefined) {
    throw BioInvalidQueryParamError({ fields })
  }

  const species = await models.SpeciesInProject.findAll({
    where: { locationProjectId },
    attributes,
    order: [['scientificName', 'ASC']],
    limit,
    offset
  })

  if (fields === 'dashboard') {
    const dashboardSpecies = species.map(({ taxonSpeciesSlug, taxonClassSlug, scientificName, commonName, riskRatingId, photoUrl }) => {
      return {
        slug: taxonSpeciesSlug,
        taxonSlug: taxonClassSlug,
        scientificName,
        commonName,
        riskId: riskRatingId,
        photoUrl
      }
    })
    return { species: dashboardSpecies }
  }

  return { species }
}
