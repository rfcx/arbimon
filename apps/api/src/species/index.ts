import { resolve } from 'path'

import { projectSpeciesAllRoute } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { projectSpeciesOneRoute } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { projectSpeciesPredictedOccupancyRoute } from '@rfcx-bio/common/api-bio/species/project-species-predicted-occupancy'

import { setIsProjectMember } from '@/_middleware/get-is-project-member'
import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { projectSpeciesAllHandler } from './controller-project-species-all'
import { projectSpeciesOneHandler } from './controller-project-species-one'
import { projectSpeciesPredictedOccupancyHandler } from './controller-project-species-predicted-occupancy'

export const mockPredictionsFolderName = 'predicted-occupancy/puerto-rico'
export const mockPredictionsFolderPath = resolve('./public', mockPredictionsFolderName)

export const routesSpecies: RouteRegistration[] = [
  {
    method: GET,
    url: projectSpeciesOneRoute,
    preHandler: [setIsProjectMember],
    handler: projectSpeciesOneHandler
  },
  {
    method: GET,
    url: projectSpeciesAllRoute,
    handler: projectSpeciesAllHandler
  },
  {
    method: GET,
    url: projectSpeciesPredictedOccupancyRoute,
    preHandler: [setIsProjectMember],
    handler: projectSpeciesPredictedOccupancyHandler
  }
]
