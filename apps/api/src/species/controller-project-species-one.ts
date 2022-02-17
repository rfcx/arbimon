import { readdir } from 'fs/promises'

import { PredictedOccupancyMap, ProjectSpeciesOneParams, ProjectSpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { EXTINCTION_RISK_PROTECTED_CODES } from '@rfcx-bio/common/iucn'
import { rawSpecies } from '@rfcx-bio/common/mock-data'

import { Handler } from '../_services/api-helpers/types'
import { ApiNotFoundError } from '../_services/errors'
import { isProjectMember } from '../_services/permission-helper/permission-helper'
import { assertParamsExist } from '../_services/validation'
import { mockPredictionsFolderPath } from './index'

// TODO ??? - Move files to S3 & index them in the database
// const mockPredictionsFolderName = 'predicted-occupancy/puerto-rico'
// const mockPredictionsFolderPath = resolve('./public', mockPredictionsFolderName)

export const projectSpeciesOneHandler: Handler<ProjectSpeciesOneResponse, ProjectSpeciesOneParams> = async (req) => {
  // Inputs & validation
  const { projectId, speciesSlug } = req.params
  assertParamsExist({ projectId, speciesSlug })

  const isLocationRedacted = !isProjectMember(req)

  // Queries
  const response: ProjectSpeciesOneResponse = await getProjectSpeciesOne(projectId, speciesSlug, isLocationRedacted)

  // Respond
  return response
}

export async function getProjectSpeciesOne (projectId: string, speciesSlug: string, noPermission: boolean): Promise<ProjectSpeciesOneResponse> {
  const species = rawSpecies.find(s => s.speciesSlug === speciesSlug)
  if (!species) throw ApiNotFoundError()

  const isLocationRedacted = EXTINCTION_RISK_PROTECTED_CODES.includes(species.extinctionRisk) && noPermission
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
    speciesInformation: species,
    predictedOccupancyMaps
  }
}
