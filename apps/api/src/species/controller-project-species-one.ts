import { Op } from 'sequelize'

import { PredictedOccupancyMap, ProjectSpeciesOneParams, ProjectSpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { LocationProjectSpeciesFileModel } from '@rfcx-bio/common/dao/models/location-project-species-file-model'
import { ATTRIBUTES_TAXON_SPECIES_CALL } from '@rfcx-bio/common/dao/models/taxon-species-call-model'
import { ATTRIBUTES_TAXON_SPECIES_PHOTO } from '@rfcx-bio/common/dao/models/taxon-species-photo-model'
import { TaxonSpeciesCallLight, TaxonSpeciesPhotoLight } from '@rfcx-bio/common/dao/types'
import { SpeciesInProject } from '@rfcx-bio/common/dao/types/species-in-project'

import { getSequelize } from '@/_services/db'
import { isProtectedSpecies } from '@/_services/security/location-redacted'
import { Handler } from '../_services/api-helpers/types'
import { isProjectMember } from '../_services/permission-helper/permission-helper'
import { assertPathParamsExist } from '../_services/validation'

// TODO ??? - Move files to S3 & index them in the database

export const projectSpeciesOneHandler: Handler<ProjectSpeciesOneResponse, ProjectSpeciesOneParams> = async (req) => {
  // Inputs & validation
  // TODO: Use species id instead of species slug
  const { projectId, speciesSlug } = req.params
  assertPathParamsExist({ projectId, speciesSlug })

  const hasProjectPermission = isProjectMember(req)

  // Respond
  return await getProjectSpeciesOne(projectId, speciesSlug, hasProjectPermission)
}

const getProjectSpeciesOne = async (locationProjectId: string, taxonSpeciesSlug: string, hasProjectPermission: boolean): Promise<ProjectSpeciesOneResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const speciesInformation = await models.SpeciesInProject.findOne({
    where: { locationProjectId, taxonSpeciesSlug },
    raw: true
  }) as unknown as SpeciesInProject

  const { taxonSpeciesId } = speciesInformation

  const speciesPhotos = await models.TaxonSpeciesPhoto.findAll({
    attributes: ATTRIBUTES_TAXON_SPECIES_PHOTO.light,
    where: { taxonSpeciesId },
    raw: true
  }) as unknown as TaxonSpeciesPhotoLight[]

  const speciesCalls = await models.TaxonSpeciesCall.findAll({
    attributes: ATTRIBUTES_TAXON_SPECIES_CALL.light,
    where: {
      [Op.and]: {
        callProjectId: locationProjectId,
        taxonSpeciesId
      }
    },
    raw: true
  }) as unknown as TaxonSpeciesCallLight[]

  const isLocationRedacted = hasProjectPermission ? false : await isProtectedSpecies(speciesInformation.riskRatingIucnId ?? -1)
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
