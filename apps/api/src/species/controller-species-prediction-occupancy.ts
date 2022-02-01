import { FastifyReply } from 'fastify'
import { resolve } from 'path'

import { SpeciesPredictionOccupancyParams } from '@rfcx-bio/common/api-bio/species/species-prediction-occupancy'

import { Handler } from '../_services/api-helpers/types'
import { ApiPermissionDenied } from '../_services/errors'
import { isProjectMember } from '../_services/permission-helper/permission-helper'
import { assertInvalidQuery, assertParamsExist } from '../_services/validation'
import { mockPredictionsFolderName, mockPredictionsFolderPath } from './index'

export const speciesPredictionOccupancyHandler: Handler<FastifyReply, SpeciesPredictionOccupancyParams> = async (req, res) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  const { filenameWithoutExtension } = req.params
  assertParamsExist({ filenameWithoutExtension })

  const isLocationRedacted = !isProjectMember(req)
  if (isLocationRedacted) throw ApiPermissionDenied()

  // Query
  const resolvedFilename = resolve(mockPredictionsFolderPath, filenameWithoutExtension)
  if (!resolvedFilename.startsWith(mockPredictionsFolderPath)) { assertInvalidQuery({ filenameWithoutExtension }) }

  // Response
  return await res.sendFile(mockPredictionsFolderName + '/' + filenameWithoutExtension + '.png')
}
