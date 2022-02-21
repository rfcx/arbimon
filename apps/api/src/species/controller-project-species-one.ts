import { readdir } from 'fs/promises'
import { Op } from 'sequelize'

import { PredictedOccupancyMap, ProjectSpeciesOneParams, ProjectSpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { ModelRepositoryFactory } from '@rfcx-bio/common/dao/model-repository'
import { CALL_MODEL_ATTRIBUTES } from '@rfcx-bio/common/dao/models/taxon-species-call-model'
import { PHOTO_MODEL_ATTRIBUTES } from '@rfcx-bio/common/dao/models/taxon-species-photo-model'
import { SpeciesCallLight, SpeciesPhotoLight } from '@rfcx-bio/common/dao/types'
import { SpeciesInProject } from '@rfcx-bio/common/dao/types/species-in-project'

import { getSequelize } from '@/_services/db'
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

  const isLocationRedacted = !isProjectMember(req)

  // Queries
  const response: ProjectSpeciesOneResponse = await getProjectSpeciesOne(projectId, speciesSlug, isLocationRedacted)

  // Respond
  return response
}

const getProjectSpeciesOne = async (projectId: string, speciesSlug: string, noPermission: boolean): Promise<ProjectSpeciesOneResponse> => {
  const sequalize = getSequelize()
  const models = ModelRepositoryFactory.getInstance(sequalize)

  const speciesInformation = await models.SpeciesInProject.findOne({
    where: {
      locationProjectId: projectId,
      taxonSpeciesSlug: speciesSlug
    },
    raw: true
  }) as unknown as SpeciesInProject

  const { taxonSpeciesId } = speciesInformation

  const speciesPhotos = await models.TaxonSpeciesPhoto.findAll({
    attributes: PHOTO_MODEL_ATTRIBUTES.light,
    where: {
      taxonSpeciesId: taxonSpeciesId
    },
    raw: true
  }) as unknown as SpeciesPhotoLight[]

  const speciesCalls = await models.TaxonSpeciesCall.findAll({
    attributes: CALL_MODEL_ATTRIBUTES.light,
    where: {
      [Op.and]: {
        callProjectId: projectId,
        taxonSpeciesId: taxonSpeciesId
      }
    },
    raw: true
  }) as unknown as SpeciesCallLight[]

  const isProtectedCodes = await models.RiskRatingIucn.findAll({
    where: {
      isThreatened: true
    },
    raw: true
  })
  const isLocationRedacted = isProtectedCodes.map(({ idOrdered }) => idOrdered)
    .includes(speciesInformation.riskRatingIucnId) && noPermission
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
