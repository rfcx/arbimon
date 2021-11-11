import { FastifyPluginAsync } from 'fastify'

export const routesProjectSite: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get('/sites', async (req, res) => {
    return ['site1', 'site2']
  })
}
