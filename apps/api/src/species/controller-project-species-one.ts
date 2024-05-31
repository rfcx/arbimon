import { type PredictedOccupancyMap, type ProjectSpeciesOneParams, type ProjectSpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { hasPermission } from '@rfcx-bio/common/roles'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { LocationProjectSpeciesFileModel } from '@rfcx-bio/node-common/dao/models/location-project-species-file-model'
import { ATTRIBUTES_TAXON_SPECIES_CALL, ATTRIBUTES_TAXON_SPECIES_PHOTO } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '@/_services/db'
import { BioNotFoundError } from '~/errors'
import { isProtectedSpecies } from '~/security/protected-species'
import { type Handler } from '../_services/api-helpers/types'
import { assertPathParamsExist } from '../_services/validation'

// TODO ??? - Move files to S3 & index them in the database

export const projectSpeciesOneHandler: Handler<ProjectSpeciesOneResponse, ProjectSpeciesOneParams> = async (req) => {
  // Inputs & validation
  // TODO: Use species id instead of species slug
  const { projectId, speciesSlug } = req.params
  assertPathParamsExist({ projectId, speciesSlug })

  // Respond
  return await getProjectSpeciesOne(projectId, speciesSlug, hasPermission(req.projectRole, 'read-insights-sensitive'))
}

const getProjectSpeciesOne = async (locationProjectId: string, taxonSpeciesSlug: string, isProjectMember: boolean): Promise<ProjectSpeciesOneResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const speciesInformation = await models.SpeciesInProject.findOne({
    where: { locationProjectId, taxonSpeciesSlug },
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
    where: { callProjectId: locationProjectId, taxonSpeciesId },
    raw: true
  })

  const isLocationRedacted = isProtectedSpecies(speciesInformation.riskRatingId) && !isProjectMember
  const predictedOccupancyMaps: PredictedOccupancyMap[] = []

  if (!isLocationRedacted) {
    const matchFiles = await LocationProjectSpeciesFileModel(sequelize).findAll({
      where: { locationProjectId, taxonSpeciesId },
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
