import { FastifyPluginAsync } from 'fastify'
import { BioIucnSpeciesRequest } from 'iucn/types'

import { ApiClientError, ApiNotFoundError, ApiServerError } from '../_services/errors/types.js'
import { getSpeciesSummary } from './iucn.js'

export const routesIucn: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get<{ Params: BioIucnSpeciesRequest } >('/iucn/info/:speciesName', async (req, res) => {
    const { speciesName } = req.params
    if (!speciesName) throw ApiClientError('speciesName is required')

    try {
      const iucnInformation = await getSpeciesSummary(speciesName)

      if (!iucnInformation) throw ApiNotFoundError(`No information found for ${speciesName}`)
      return iucnInformation
    } catch (e) {
      console.error('IUCN:', e)
      throw ApiServerError()
    }
  })
}
