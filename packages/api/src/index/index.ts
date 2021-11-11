import { FastifyPluginAsync } from 'fastify'

export const routesIndex: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get('/', async (req, res) => {
    return { hello: 'world' }
  })
}
