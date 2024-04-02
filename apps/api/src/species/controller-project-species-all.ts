import { Op, QueryTypes } from 'sequelize'

import {
  type ProjectRiskRatingsParams,
  type ProjectRiskRatingsResponse,
  type ProjectSpeciesParams,
  type ProjectSpeciesQueryParams,
  type ProjectSpeciesResponse,
  type RiskRating
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

export const projectRiskRatingsHandler: Handler<ProjectRiskRatingsResponse, ProjectRiskRatingsParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const riskRatings = await getProjectRiskRatings(projectIdInteger)
  return { riskRatings }
}

export const getProjectSpecies = async (locationProjectId: number, params: ProjectSpeciesQueryParams): Promise<ProjectSpeciesResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)
  const { limit = 100, offset = 0, fields = 'light', keyword, riskRatingId } = params
  const attributes = ATTRIBUTES_SPECIES_IN_PROJECT[fields]

  if (attributes === undefined) {
    throw BioInvalidQueryParamError({ fields })
  }

  // Allow searching by name
  const keywordClause =
      keyword !== undefined
        ? {
        [Op.or]: [
          {
            scientificName: { [Op.iLike]: `%${String(keyword)}%` }
          },
          {
            commonName: { [Op.iLike]: `%${String(keyword)}%` }
          }
        ]
      }
      : {}

  const statusClause = riskRatingId !== undefined ? { riskRatingId } : {}

  const where = { locationProjectId, ...keywordClause, ...statusClause }

  const result = await models.SpeciesInProject.findAndCountAll({
    where,
    attributes,
    order: [['scientificName', 'ASC']],
    limit,
    offset
  })

  const { rows: species = [], count: total = 0 } = result

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
    return { species: dashboardSpecies, total }
  }

  return { species, total }
}

export const getProjectRiskRatings = async (locationProjectId: number): Promise<RiskRating[]> => {
  const sequelize = getSequelize()

  const sql = `
  select 
    distinct (r.code), r.id
  from species_in_project s 
  left join risk_rating_iucn r on r.id = s.risk_rating_id
  where s.location_project_id = :id
  order by r.id
  `
  return await sequelize.query<RiskRating>(sql, {
    raw: true,
    replacements: {
      id: locationProjectId
    },
    type: QueryTypes.SELECT
  })
}
