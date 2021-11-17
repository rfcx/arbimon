import { FastifyPluginAsync } from 'fastify'
import { getSpeciesSummary } from 'iucn/iucn'
import { IUCNRoute } from 'iucn/types'

export const routedIUCN: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get<IUCNRoute>('/iucn/info/:speciesName', async (req, res) => {
    const { speciesName } = req.params

    if (!speciesName) {
      await res.code(404).send({
        error: 'Bad request',
        message: 'Missing species name'
      })
    }

    try {
      const iucnInformation = await getSpeciesSummary(speciesName)
      await res.code(200).send(iucnInformation)
    } catch {
      await res.code(500).send({
        error: 'Server error',
        message: 'Can\'t get species information.'
      })
    }
  })
}
