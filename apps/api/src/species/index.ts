import { resolve } from 'path'

import { projectSpeciesAllRoute } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { projectSpeciesOneRoute } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { speciesAllRoute } from '@rfcx-bio/common/api-bio/species/species-all'
import { speciesOneRoute } from '@rfcx-bio/common/api-bio/species/species-one'
import { speciesPredictionOccupancyRoute } from '@rfcx-bio/common/api-bio/species/species-prediction-occupancy'

import { GET, RouteRegistration } from '../_services/api-helper/types'
import { verifyProjectUserPermission } from '../_services/decorators'
import { projectSpeciesAllController } from './controller-project-species-all'
import { projectSpeciesOneController } from './controller-project-species-one'
import { speciesAllController } from './controller-species-all'
import { speciesOneController } from './controller-species-one'
import { speciesPredictionOccupancyController } from './controller-species-prediction-occupancy'

export const mockPredictionsFolderName = 'predicted-occupancy/puerto-rico'
export const mockPredictionsFolderPath = resolve('./public', mockPredictionsFolderName)

export const routesSpecies: RouteRegistration[] = [
  {
    method: GET,
    route: speciesOneRoute,
    controller: speciesOneController
  },
  {
    method: GET,
    route: speciesAllRoute,
    controller: speciesAllController
  },
  {
    method: GET,
    route: projectSpeciesOneRoute,
    controller: projectSpeciesOneController,
    preHandler: [
      verifyProjectUserPermission
    ]
  },
  {
    method: GET,
    route: projectSpeciesAllRoute,
    controller: projectSpeciesAllController
  },
  {
    method: GET,
    route: speciesPredictionOccupancyRoute,
    controller: speciesPredictionOccupancyController,
    preHandler: [
      verifyProjectUserPermission
    ]
  }
]
