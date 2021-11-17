import { FastifyPluginAsync } from 'fastify'
import { IUCNRoute } from 'iucn/types'

import { getSpeciesSummary } from './iucn.js'

export const routesIUCN: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get<IUCNRoute>('/iucn/info/:speciesName', async (req, res) => {
    const { speciesName } = req.params

    if (!speciesName) {
      return await res.code(404).send({
        error: 'Bad request',
        message: 'Missing species name'
      })
    }

    try {
      const iucnInformation = await getSpeciesSummary(speciesName)
      if (!iucnInformation) {
        return await res.send({
          message: 'Species not found'
        })
      }
      return await res.send(iucnInformation)
    } catch (e) {
      return await res.code(500).send({
        error: 'Server error',
        message: 'Can\'t get species information.'
      })
    }
  })
}
