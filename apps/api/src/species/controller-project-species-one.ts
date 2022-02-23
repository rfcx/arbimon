import { readdir } from 'fs/promises'
import { Op } from 'sequelize'

import { PredictedOccupancyMap, ProjectSpeciesOneParams, ProjectSpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_TAXON_SPECIES_CALL } from '@rfcx-bio/common/dao/models/taxon-species-call-model'
import { ATTRIBUTES_TAXON_SPECIES_PHOTO } from '@rfcx-bio/common/dao/models/taxon-species-photo-model'
import { SpeciesCallLight, SpeciesPhotoLight } from '@rfcx-bio/common/dao/types'
import { SpeciesInProject } from '@rfcx-bio/common/dao/types/species-in-project'

import { getSequelize } from '@/_services/db'
import { isProtectedSpecies } from '@/_services/security/location-redacted'
import { Handler } from '../_services/api-helpers/types'
import { isProjectMember } from '../_services/permission-helper/permission-helper'
import { assertPathParamsExist } from '../_services/validation'
import { mockPredictionsFolderPath } from './index'

// TODO ??? - Move files to S3 & index them in the database

export const projectSpeciesOneHandler: Handler<ProjectSpeciesOneResponse, ProjectSpeciesOneParams> = async (req) => {
  // Inputs & validation
  // TODO: Use species id instead of species slug
  const { projectId, speciesSlug } = req.params
  assertPathParamsExist({ projectId, speciesSlug })

  const noPermission = !isProjectMember(req)

  // Queries
  const response: ProjectSpeciesOneResponse = await getProjectSpeciesOne(projectId, speciesSlug, noPermission)

  // Respond
  return response
}

const getProjectSpeciesOne = async (projectId: string, speciesSlug: string, noPermission: boolean): Promise<ProjectSpeciesOneResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const speciesInformation = await models.SpeciesInProject.findOne({
    where: {
      locationProjectId: projectId,
      taxonSpeciesSlug: speciesSlug
    },
    raw: true
  }) as unknown as SpeciesInProject

  const { taxonSpeciesId } = speciesInformation

  const speciesPhotos = await models.TaxonSpeciesPhoto.findAll({
    attributes: ATTRIBUTES_TAXON_SPECIES_PHOTO.light,
    where: {
      taxonSpeciesId: taxonSpeciesId
    },
    raw: true
  }) as unknown as SpeciesPhotoLight[]

  const speciesCalls = await models.TaxonSpeciesCall.findAll({
    attributes: ATTRIBUTES_TAXON_SPECIES_CALL.light,
    where: {
      [Op.and]: {
        callProjectId: projectId,
        taxonSpeciesId: taxonSpeciesId
      }
    },
    raw: true
  }) as unknown as SpeciesCallLight[]

  const isLocationRedacted = noPermission && (await isProtectedSpecies(speciesInformation.riskRatingIucnId))
  const predictedOccupancyMaps: PredictedOccupancyMap[] = isLocationRedacted
    ? []
    : (await readdir(mockPredictionsFolderPath))
      .filter(filename => filename.startsWith(speciesSlug))
      .map(filename => filename.substring(0, filename.lastIndexOf('.')) || filename)
      .sort()
      .map(filename => ({
        title: filename,
        url: `/projects/${projectId}/predicted-occupancy/${filename}`
      }))

  return {
    speciesInformation,
    speciesPhotos,
    speciesCalls,
    predictedOccupancyMaps
  }
}
