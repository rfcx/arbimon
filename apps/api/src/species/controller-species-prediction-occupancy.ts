import { ApiPermissionDenied } from '_services/errors'
import { FastifyReply } from 'fastify'
import { resolve } from 'path'

import { SpeciesPredictionOccupancyParams } from '@rfcx-bio/common/api-bio/species/species-prediction-occupancy'

import { Handler } from '../_services/api-helper/types'
import { assertInvalidQuery, assertParamsExist } from '../_services/validation'
import { mockPredictionsFolderName, mockPredictionsFolderPath } from './index'

export const speciesPredictionOccupancyHandler: Handler<FastifyReply, SpeciesPredictionOccupancyParams> = async (req, res) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  const { filenameWithoutExtension } = req.params
  assertParamsExist({ filenameWithoutExtension })

  const noPermission = req.requestContext.get('projectPermission') === undefined
  if (noPermission) throw ApiPermissionDenied()

  // Query
  const resolvedFilename = resolve(mockPredictionsFolderPath, filenameWithoutExtension)
  if (!resolvedFilename.startsWith(mockPredictionsFolderPath)) { assertInvalidQuery({ filenameWithoutExtension }) }

  // Response
  return await res.sendFile(mockPredictionsFolderName + '/' + filenameWithoutExtension + '.png')
}
