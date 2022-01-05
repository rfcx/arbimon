import { FastifyPluginAsync } from 'fastify'

import { BioIucnSpeciesRequest, BioIucnSpeciesResponse } from '@rfcx-bio/common/api-bio/species/species-iucn'

import { env } from '../../_services/env'
import { ApiMissingParam, ApiNotFoundError, ApiServerError } from '../../_services/errors'
import { getSpeciesInformation } from './iucn'

export const routesIucn: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get<{ Params: Partial<BioIucnSpeciesRequest> } >('/iucn/info/:scientificName', async (req, res): Promise<BioIucnSpeciesResponse> => {
    // Input params
    const { scientificName } = req.params
    if (!scientificName) throw ApiMissingParam('scientificName')

    // Call IUCN API
    const iucnInformation = await getSpeciesInformation(scientificName)
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
      redirectUrl: `${env.IUCN_BASE_URL}/website/${scientificName}`
    }
  })
}
