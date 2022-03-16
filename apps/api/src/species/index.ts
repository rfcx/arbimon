import { resolve } from 'path'

import { projectSpeciesAllRoute } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { projectSpeciesOneRoute } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { speciesAllRoute } from '@rfcx-bio/common/api-bio/species/species-all'
import { speciesOneRoute } from '@rfcx-bio/common/api-bio/species/species-one'
import { speciesPredictionOccupancyRoute } from '@rfcx-bio/common/api-bio/species/species-prediction-occupancy'

import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { verifyProjectUserPermission } from '../_services/decorators'
import { projectSpeciesAllHandler } from './controller-project-species-all'
import { projectSpeciesOneHandler } from './controller-project-species-one'
import { speciesAllHandler } from './controller-species-all'
import { speciesOneHandler } from './controller-species-one'
import { speciesPredictionOccupancyHandler } from './controller-species-prediction-occupancy'

export const mockPredictionsFolderName = 'predicted-occupancy/puerto-rico'
export const mockPredictionsFolderPath = resolve('./public', mockPredictionsFolderName)

export const routesSpecies: RouteRegistration[] = [
  {
    method: GET,
    url: speciesOneRoute,
    handler: speciesOneHandler
  },
  {
    method: GET,
    url: speciesAllRoute,
    handler: speciesAllHandler
  },
  {
    method: GET,
    url: projectSpeciesOneRoute,
    handler: projectSpeciesOneHandler,
    preHandler: [
      verifyProjectUserPermission
    ]
  },
  {
    method: GET,
    url: projectSpeciesAllRoute,
    handler: projectSpeciesAllHandler
  },
  {
    method: GET,
    url: speciesPredictionOccupancyRoute,
    handler: speciesPredictionOccupancyHandler,
    preHandler: [
      verifyProjectUserPermission
    ]
  }
]
