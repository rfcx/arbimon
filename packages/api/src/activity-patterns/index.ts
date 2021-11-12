import { FastifyPluginAsync } from 'fastify'
import { readdir } from 'fs/promises'
import { resolve } from 'path'

// TODO ??? - Move files to S3 & index them in the database
const mockPredictionsFolderName = 'ap-predictions'
const mockPredictionsFolderPath = resolve('./public', mockPredictionsFolderName)

export const routesActivityPatterns: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get<{ Params: { speciesId?: string } }>('/activity-patterns/:speciesId', async (req, res) => {
    // Inputs & validation
    const { speciesId } = req.params
    if (!speciesId) return { error: 'missing speciesId' }

    // Queries
    const predictedOccupancyImages = (await readdir(mockPredictionsFolderPath))
      .filter(filename => filename.startsWith(speciesId))

    // Respond
    return { predictedOccupancyImages } // TODO ??? - return the rest of the data
  })

  app.get<{ Params: { filename: string } }>('/activity-patterns/predicted-occupancy/:filename', async (req, res) => {
    // Inputs & validation
    const { filename } = req.params
    if (!filename) return { error: 'missing filename' }

    // Queries
    const resolvedFilename = resolve(mockPredictionsFolderPath, filename)
    if (!resolvedFilename.startsWith(mockPredictionsFolderPath)) return { error: 'illegal filename' }

    // Respond
    return await res.sendFile(mockPredictionsFolderName + '/' + filename)
  })
}
