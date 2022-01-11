import { readdir } from 'fs/promises'

import { PredictedOccupancyMap, ProjectSpeciesOneParams, ProjectSpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { rawSpecies } from '@rfcx-bio/common/mock-data'
import { criticallyEndangeredSpeciesIds } from '@rfcx-bio/common/mock-data/critically-endangered-species'

import { ApiNotFoundError } from '~/errors'
import { Controller } from '../_services/api-helper/types'
import { assertParamsExist } from '../_services/validation'
import { mockPredictionsFolderPath } from './index'

// TODO ??? - Move files to S3 & index them in the database
// const mockPredictionsFolderName = 'predicted-occupancy/puerto-rico'
// const mockPredictionsFolderPath = resolve('./public', mockPredictionsFolderName)

export const projectSpeciesOneController: Controller<ProjectSpeciesOneResponse, ProjectSpeciesOneParams> = async (req) => {
  // Inputs & validation
  const { projectId, speciesSlug } = req.params
  if (!projectId) assertParamsExist({ projectId })
  if (!speciesSlug) assertParamsExist({ speciesSlug })

  // Queries
  const response: ProjectSpeciesOneResponse = await getProjectSpeciesOne(projectId, speciesSlug)

  // Respond
  return response
}

export async function getProjectSpeciesOne (projectId: string, speciesSlug: string): Promise<ProjectSpeciesOneResponse> {
  const species = rawSpecies.find(s => s.speciesSlug === speciesSlug)
  if (!species) throw ApiNotFoundError()

  const predictedOccupancyMaps: PredictedOccupancyMap[] = criticallyEndangeredSpeciesIds.has(species.speciesId)
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
