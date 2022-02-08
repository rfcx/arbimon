// Request
export interface SpeciesPredictionOccupancyParams {
  projectId: string
  filenameWithoutExtension: string
}

export const speciesPredictionOccupancyRoute = '/projects/:projectId/predicted-occupancy/:filenameWithoutExtension'

export const speciesPredictionOccupancyGeneratedUrl = (params: SpeciesPredictionOccupancyParams): string =>
  `/projects/${params.projectId}/predicted-occupancy/${params.filenameWithoutExtension}`

// Response - FastifyReply
