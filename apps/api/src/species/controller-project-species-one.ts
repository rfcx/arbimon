import { Op } from 'sequelize'

import { PredictedOccupancyMap, ProjectSpeciesOneParams, ProjectSpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { RISK_RATING_PROTECTED_IDS_SET } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_TAXON_SPECIES_CALL, ATTRIBUTES_TAXON_SPECIES_PHOTO } from '@rfcx-bio/common/dao/types'

import { getIsProjectMember } from '@/_middleware/get-is-project-member'
import { getSequelize } from '@/_services/db'
import { BioNotFoundError } from '~/errors'
import { Handler } from '../_services/api-helpers/types'
import { assertPathParamsExist } from '../_services/validation'

// TODO ??? - Move files to S3 & index them in the database

export const projectSpeciesOneHandler: Handler<ProjectSpeciesOneResponse, ProjectSpeciesOneParams> = async (req) => {
  // Inputs & validation
  // TODO: Use species id instead of species slug
  const { projectId, speciesSlug } = req.params
  assertPathParamsExist({ projectId, speciesSlug })

  const isProjectMember = getIsProjectMember(req)

  // Respond
  return await getProjectSpeciesOne(projectId, speciesSlug, isProjectMember)
}

const getProjectSpeciesOne = async (projectId: string, taxonSpeciesSlug: string, isProjectMember: boolean): Promise<ProjectSpeciesOneResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const speciesInformation = await models.SpeciesInProject.findOne({
    where: { projectId, taxonSpeciesSlug },
    raw: true
  })

  if (!speciesInformation) throw BioNotFoundError()

  const { taxonSpeciesId } = speciesInformation

  const speciesPhotos = await models.TaxonSpeciesPhoto.findAll({
    attributes: ATTRIBUTES_TAXON_SPECIES_PHOTO.light,
    where: { taxonSpeciesId },
    raw: true
  })

  const speciesCalls = await models.TaxonSpeciesCall.findAll({
    attributes: ATTRIBUTES_TAXON_SPECIES_CALL.light,
    where: {
      [Op.and]: {
        callProjectId: projectId,
        taxonSpeciesId
      }
    },
    raw: true
  })

  const isLocationRedacted = RISK_RATING_PROTECTED_IDS_SET.has(speciesInformation.riskRatingId) && !isProjectMember
  const predictedOccupancyMaps: PredictedOccupancyMap[] = []

  if (!isLocationRedacted) {
    const matchFiles = await models.TaxonSpeciesProjectFile.findAll({
      where: { projectId, taxonSpeciesId },
      raw: true
    }).then(results => results.map(({ filename, url }) => ({ title: filename, url })))
    predictedOccupancyMaps.push(...matchFiles)
  }

  return {
    speciesInformation,
    speciesPhotos,
    speciesCalls,
    predictedOccupancyMaps
  }
}
