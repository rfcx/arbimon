import { FastifyPluginAsync } from 'fastify'

import { env } from '../../_services/env'
import { ApiMissingParam, ApiNotFoundError, ApiServerError } from '../../_services/errors'
import { getSpeciesInformation } from './iucn'
import { BioIucnSpeciesRequest, BioIucnSpeciesResponse } from './types'

export const routesIucn: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get<{ Params: Partial<BioIucnSpeciesRequest> } >('/iucn/info/:speciesName', async (req, res): Promise<BioIucnSpeciesResponse> => {
    // Input params
    const { speciesName } = req.params
    if (!speciesName) throw ApiMissingParam('speciesName')

    // Call IUCN API
    const iucnInformation = await getSpeciesInformation(speciesName)
      .catch(e => {
        // Error: calling IUCN API
        console.error('IUCN:', e)
        throw ApiServerError()
      })

    // Error: not found
    if (!iucnInformation) throw ApiNotFoundError()

    // Transform & return
    return {
      content: iucnInformation?.habitat ?? iucnInformation?.rationale ?? '',
      redirectUrl: `${env.IUCN_BASE_URL}/website/${speciesName}`
    }
  })
}
