import { FastifyPluginAsync } from 'fastify'

export const routesStatus: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get('/', async (req, res) => {
    return { hello: 'world' }
  })
}
