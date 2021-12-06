import { FastifyPluginAsync } from 'fastify'

export const routesRichness: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get('/richness', async (req, res) => {
    return { 'todo:': 'build this' }
  })
}
