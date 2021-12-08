import { FastifyPluginAsync } from 'fastify'

import { ApiMissingParam, ApiNotFoundError } from '../_services/errors/index.js'
import { rawSpecies } from '../Z_MOCK/raw-species.js'

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
}
