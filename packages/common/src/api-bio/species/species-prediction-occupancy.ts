import { ProjectSpecificRouteParams } from '../_helpers'

// Request
export type SpeciesPredictionOccupancyParams = ProjectSpecificRouteParams & {
  speciesSlug: string
  filenameWithoutExtension: string
}

export const speciesPredictionOccupancyRoute = '/projects/:projectId/predicted-occupancy/:speciesSlug/:filenameWithoutExtension'

export const speciesPredictionOccupancyGeneratedUrl = (params: SpeciesPredictionOccupancyParams): string =>
  `/projects/${params.projectId}/predicted-occupancy/${params.speciesSlug}/${params.filenameWithoutExtension}`

// Response - FastifyReply
