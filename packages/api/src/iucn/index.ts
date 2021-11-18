import { FastifyPluginAsync } from 'fastify'
import { IUCNRoute } from 'iucn/types'

import { APIError } from '../_services/errors/types.js'
import { getSpeciesSummary } from './iucn.js'

export const routesIucn: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get<IUCNRoute>('/iucn/info/:speciesName', async (req, res) => {
    const { speciesName } = req.params

    if (!speciesName) {
      return await res.code(404).send({ message: 'Missing species name' })
    }

    try {
      const iucnInformation = await getSpeciesSummary(speciesName)
      return await res.send(iucnInformation)
    } catch (e) {
      console.error('IUCN:', e)
      if (e instanceof APIError) {
        return await res.code(e.code).send({ message: e.message })
      }

      return await res.code(500).send({ message: 'Can\'t get species information.' })
    }
  })
}
