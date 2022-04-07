import { FastifyReply } from 'fastify'
import { resolve } from 'path'

import { ProjectSpeciesFileParams } from '@rfcx-bio/common/api-bio/species/project-species-file'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getIsProjectMember } from '@/_middleware/get-is-project-member'
import { getSequelize } from '~/db'
import { isProtectedSpecies } from '~/security/protected-species'
import { Handler } from '../_services/api-helpers/types'
import { BioForbiddenError, BioInvalidPathParamError, BioNotFoundError } from '../_services/errors'
import { assertPathParamsExist } from '../_services/validation'
import { mockPredictionsFolderName, mockPredictionsFolderPath } from './index'

export const projectSpeciesFileHandler: Handler<FastifyReply, ProjectSpeciesFileParams> = async (req, res) => {
  // Inputs & validation
  const { projectId, speciesSlug, filenameWithoutExtension } = req.params
  assertPathParamsExist({ projectId, speciesSlug, filenameWithoutExtension })

  // Query species
  const species = await ModelRepository.getInstance(getSequelize())
    .SpeciesInProject
    .findOne({
      where: { taxonSpeciesSlug: speciesSlug }
    })

  if (!species) throw BioNotFoundError()

  const isLocationRedacted = isProtectedSpecies(species.riskRatingId) && !getIsProjectMember(req)
  if (isLocationRedacted) throw BioForbiddenError()

  // Query file
  const resolvedFilename = resolve(mockPredictionsFolderPath, filenameWithoutExtension)
  if (!resolvedFilename.startsWith(mockPredictionsFolderPath)) throw BioInvalidPathParamError({ filenameWithoutExtension })

  // Response
  return await res.sendFile(mockPredictionsFolderName + '/' + filenameWithoutExtension + '.png')
}
