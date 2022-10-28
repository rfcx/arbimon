import { FastifyReply } from 'fastify'
import { resolve } from 'path'

import { ProjectSpeciesPredictedOccupancyParams } from '@rfcx-bio/common/api-bio/species/project-species-predicted-occupancy'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getIsProjectMember } from '@/_middleware/get-is-project-member'
import { getSequelize } from '~/db'
import { isProtectedSpecies } from '~/security/protected-species'
import { Handler } from '../_services/api-helpers/types'
import { BioForbiddenError, BioInvalidPathParamError, BioNotFoundError } from '../_services/errors'
import { assertPathParamsExist } from '../_services/validation'
import { mockPredictionsFolderName, mockPredictionsFolderPath } from './index'

export const projectSpeciesPredictedOccupancyHandler: Handler<FastifyReply, ProjectSpeciesPredictedOccupancyParams> = async (req, res) => {
  // Inputs & validation
  const { projectId, speciesSlug, filenameWithoutExtension } = req.params
  assertPathParamsExist({ projectId, speciesSlug, filenameWithoutExtension })

  const { SpeciesInProject, LocationProject } = ModelRepository.getInstance(getSequelize())

  // Query species
  const species = await SpeciesInProject.findOne({
      where: { locationProjectId: projectId, taxonSpeciesSlug: speciesSlug }
    })
  if (!species) throw BioNotFoundError()

  const isLocationRedacted = isProtectedSpecies(species.riskRatingId) && !getIsProjectMember(req)
  if (isLocationRedacted) throw BioForbiddenError()

  // Query project
  const project = await LocationProject.findByPk(projectId)
  if (!project) throw BioNotFoundError()

  // Query file
  const resolvedFilename = resolve(mockPredictionsFolderPath(project.slug), filenameWithoutExtension)
  if (!resolvedFilename.startsWith(mockPredictionsFolderPath(project.slug))) throw BioInvalidPathParamError({ filenameWithoutExtension })

  // Response
  return await res.sendFile(`${mockPredictionsFolderName(project.slug)}/${filenameWithoutExtension}.png`)
}
