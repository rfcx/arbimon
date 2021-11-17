import { FastifyPluginAsync } from 'fastify'

export const routesSpeciesRichness: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get('/species-richness', async (req, res) => {
    return { 'todo:': 'build this' }
  })
}
