import { FastifyPluginAsync, FastifyReply } from 'fastify'
import { readdir } from 'fs/promises'
import { resolve } from 'path'

import { PredictedOccupancyMap, ProjectSpeciesRouteResponse } from '@rfcx-bio/common/api-bio/species/project-species'
import { rawSpecies } from '@rfcx-bio/common/mock-data'
import { criticallyEndangeredSpeciesIds } from '@rfcx-bio/common/mock-data/critically-endangered-species'

import { ApiClientError, ApiMissingParam, ApiNotFoundError } from '../_services/errors'

// TODO ??? - Move files to S3 & index them in the database
const mockPredictionsFolderName = 'predicted-occupancy/puerto-rico'
const mockPredictionsFolderPath = resolve('./public', mockPredictionsFolderName)

export const routesSpecies: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get('/species', async (req, res) => rawSpecies)

  interface SpeciesRoute {
    Params: {
      speciesSlug?: string
    }
  }
  app.get<SpeciesRoute>('/species/:speciesSlug', async (req, res) => {
    // Inputs & validation
    const { speciesSlug } = req.params
    if (!speciesSlug) throw ApiMissingParam('speciesSlug')

    // Query
    const matchesSpecies = rawSpecies.find(s => s.speciesSlug === speciesSlug)

    // Response
    if (!matchesSpecies) throw ApiNotFoundError()
    return matchesSpecies
  })

  interface ProjectSpeciesRoute {
    Params: {
      projectId?: string
      speciesSlug?: string
    }
  }
  app.get<ProjectSpeciesRoute>('/projects/:projectId/species/:speciesSlug', async (req, res) => {
    // Inputs & validation
    const { projectId, speciesSlug } = req.params
    if (!projectId) throw ApiMissingParam('projectId')
    if (!speciesSlug) throw ApiMissingParam('speciesSlug')

    // Queries
    const species = rawSpecies.find(s => s.speciesSlug === speciesSlug)
    if (!species) throw ApiNotFoundError()

    const predictedOccupancyMaps: PredictedOccupancyMap[] = criticallyEndangeredSpeciesIds.has(species.speciesId)
      ? []
      : (await readdir(mockPredictionsFolderPath))
        .filter(filename => filename.startsWith(speciesSlug))
        .map(filename => filename.substr(0, filename.lastIndexOf('.')) || filename)
        .sort()
        .map(filename => ({
          title: filename,
          url: `/projects/${projectId}/predicted-occupancy/${filename}`
        }))

    // Respond
    const response: ProjectSpeciesRouteResponse = {
      predictedOccupancyMaps
    }
    return response
  })

  interface ProjectSpeciesPredictedOccupancyRoute {
    Params: {
      filenameWithoutExtension: string
    }
  }
  app.get<ProjectSpeciesPredictedOccupancyRoute>('/projects/:projectId/predicted-occupancy/:filenameWithoutExtension', async (req, res): Promise<FastifyReply> => {
    // Inputs & validation
    const { filenameWithoutExtension } = req.params
    if (!filenameWithoutExtension) throw ApiMissingParam('filename')

    // Queries
    const resolvedFilename = resolve(mockPredictionsFolderPath, filenameWithoutExtension)
    if (!resolvedFilename.startsWith(mockPredictionsFolderPath)) throw ApiClientError()

    // Respond
    return await res.sendFile(mockPredictionsFolderName + '/' + filenameWithoutExtension + '.png')
  })
}
