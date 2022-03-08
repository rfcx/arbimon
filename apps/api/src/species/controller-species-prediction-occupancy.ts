import { FastifyReply } from 'fastify'
import { resolve } from 'path'

import { SpeciesPredictionOccupancyParams } from '@rfcx-bio/common/api-bio/species/species-prediction-occupancy'
import { rawSpecies } from '@rfcx-bio/common/mock-data'

import { RISK_RATING_PROTECTED_CODES } from '~/risk-ratings'
import { Handler } from '../_services/api-helpers/types'
import { BioForbiddenError, BioInvalidPathParamError, BioNotFoundError } from '../_services/errors'
import { isProjectMember } from '../_services/permission-helper/permission-helper'
import { assertPathParamsExist } from '../_services/validation'
import { mockPredictionsFolderName, mockPredictionsFolderPath } from './index'

export const speciesPredictionOccupancyHandler: Handler<FastifyReply, SpeciesPredictionOccupancyParams> = async (req, res) => {
  // Inputs & validation
  const { projectId, speciesSlug, filenameWithoutExtension } = req.params
  assertPathParamsExist({ projectId, speciesSlug, filenameWithoutExtension })

  const species = rawSpecies.find(({ speciesSlug: sp }) => sp === speciesSlug)
  if (!species) throw BioNotFoundError()

  const protectedSpecies = RISK_RATING_PROTECTED_CODES.includes(species.extinctionRisk)
  const isLocationRedacted = !isProjectMember(req) && protectedSpecies
  if (isLocationRedacted) throw BioForbiddenError()

  // Query
  const resolvedFilename = resolve(mockPredictionsFolderPath, filenameWithoutExtension)
  if (!resolvedFilename.startsWith(mockPredictionsFolderPath)) throw BioInvalidPathParamError({ filenameWithoutExtension })

  // Response
  return await res.sendFile(mockPredictionsFolderName + '/' + filenameWithoutExtension + '.png')
}
