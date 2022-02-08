import { FastifyReply } from 'fastify'
import { resolve } from 'path'

import { SpeciesPredictionOccupancyParams } from '@rfcx-bio/common/api-bio/species/species-prediction-occupancy'
import { EXTINCTION_RISK_PROTECTED_CODES } from '@rfcx-bio/common/iucn'
import { rawSpecies } from '@rfcx-bio/common/mock-data'

import { Handler } from '../_services/api-helpers/types'
import { ApiClientError, ApiPermissionDenied } from '../_services/errors'
import { isProjectMember } from '../_services/permission-helper/permission-helper'
import { assertInvalidQuery, assertParamsExist } from '../_services/validation'
import { mockPredictionsFolderName, mockPredictionsFolderPath } from './index'

export const speciesPredictionOccupancyHandler: Handler<FastifyReply, SpeciesPredictionOccupancyParams> = async (req, res) => {
  // Inputs & validation
  const { projectId, speciesSlug, filenameWithoutExtension } = req.params
  console.log({ params: req.params })
  assertParamsExist({ projectId, speciesSlug, filenameWithoutExtension })

  const species = rawSpecies.find(({ speciesSlug: sp }) => sp === speciesSlug)
  if (!species) throw ApiClientError('speciesSlug', speciesSlug)

  const protectedSpecies = EXTINCTION_RISK_PROTECTED_CODES.includes(species.extinctionRisk)
  const isLocationRedacted = !isProjectMember(req) && protectedSpecies
  if (isLocationRedacted) throw ApiPermissionDenied()

  // Query
  const resolvedFilename = resolve(mockPredictionsFolderPath, filenameWithoutExtension)
  if (!resolvedFilename.startsWith(mockPredictionsFolderPath)) { assertInvalidQuery({ filenameWithoutExtension }) }

  // Response
  return await res.sendFile(mockPredictionsFolderName + '/' + filenameWithoutExtension + '.png')
}
