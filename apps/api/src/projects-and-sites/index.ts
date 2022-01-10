import { FastifyPluginAsync } from 'fastify'

// TODO ??? Authenticate the user & filter their results!!
export const routesProjectSite: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get('/projects', async (req, res) => {
    return ['project1', 'project2']
  })

  app.get('/sites', async (req, res) => {
    return ['site1', 'site2']
  })
}
