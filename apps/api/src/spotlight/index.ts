import { FastifyPluginAsync } from 'fastify'

export const routesSpotlight: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get('/spotlight', async (req, res) => {
    return { 'todo:': 'build this' }
  })
}
