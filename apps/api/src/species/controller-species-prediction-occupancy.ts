import { FastifyReply } from 'fastify'
import { resolve } from 'path'

import { SpeciesPredictionOccupancyParams } from '@rfcx-bio/common/api-bio/species/species-prediction-occupancy'

import { ApiClientError } from '~/errors'
import { Controller } from '../_services/api-helper/types'
import { assertParamsExist } from '../_services/validation'
import { mockPredictionsFolderName, mockPredictionsFolderPath } from './index'

export const speciesPredictionOccupancyController: Controller<FastifyReply, SpeciesPredictionOccupancyParams> = async (req, res) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  const { filenameWithoutExtension } = req.params
  assertParamsExist({ filenameWithoutExtension })

  // Query
  const resolvedFilename = resolve(mockPredictionsFolderPath, filenameWithoutExtension)
  if (!resolvedFilename.startsWith(mockPredictionsFolderPath)) throw ApiClientError()

  // Response
  return await res.sendFile(mockPredictionsFolderName + '/' + filenameWithoutExtension + '.png')
}
