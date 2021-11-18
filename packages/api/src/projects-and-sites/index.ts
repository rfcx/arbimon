import { FastifyPluginAsync } from 'fastify'
import { readdir } from 'fs/promises'
import { resolve } from 'path'

// TODO ??? - Move files to S3 & index them in the database
const mockPredictionsFolderName = 'predicted-occupancy/puerto-rico'
const mockPredictionsFolderPath = resolve('./public', mockPredictionsFolderName)

// TODO ??? Authenticate the user & filter their results!!
export const routesProjectSite: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get('/projects', async (req, res) => {
    return ['project1', 'project2']
  })

  app.get('/sites', async (req, res) => {
    return ['site1', 'site2']
  })

  interface ProjectSpeciesRoute {
    Params: {
      projectId?: string
      speciesId?: string
    }
  }
  app.get<ProjectSpeciesRoute>('/projects/:projectId/species/:speciesId', async (req, res) => {
    // Inputs & validation
    const { projectId, speciesId } = req.params
    if (!projectId) return { error: 'missing projectId' }
    if (!speciesId) return { error: 'missing speciesId' }

    // Queries
    const predictedOccupancyMaps = (await readdir(mockPredictionsFolderPath))
      .filter(filename => filename.startsWith(speciesId))
      .map(filename => filename.substr(0, filename.lastIndexOf('.')) || filename)
      .sort()
      .map(filename => ({
        title: filename,
        url: `/projects/${projectId}/predicted-occupancy/${filename}`
      }))

    // Respond
    return { predictedOccupancyMaps } // TODO ??? - return the rest of the data
  })

  interface ProjectSpeciesPredictedOccupancyRoute {
    Params: {
      filename: string
    }
  }
  app.get<ProjectSpeciesPredictedOccupancyRoute>('/projects/:projectId/predicted-occupancy/:filename', async (req, res) => {
    // Inputs & validation
    const { filename } = req.params
    if (!filename) return { error: 'missing filename' }

    // Queries
    const resolvedFilename = resolve(mockPredictionsFolderPath, filename)
    if (!resolvedFilename.startsWith(mockPredictionsFolderPath)) return { error: 'illegal filename' }

    // Respond
    return await res.sendFile(mockPredictionsFolderName + '/' + filename + '.png')
  })
}
