import { FastifyPluginAsync } from 'fastify'

export const routesActivityPatterns: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get('/activity-patterns', async (req, res) => {
    return { 'todo:': 'build this' }
  })
}
