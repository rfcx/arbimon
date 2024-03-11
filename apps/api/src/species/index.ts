import { resolve } from 'path'

import { projectSpeciesRoute } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { projectSpeciesOneRoute } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { projectSpeciesPredictedOccupancyRoute } from '@rfcx-bio/common/api-bio/species/project-species-predicted-occupancy'

import { requireProjectPermission } from '@/_hooks/require-permission'
import { type RouteRegistration, GET } from '../_services/api-helpers/types'
import { projectSpeciesHandler } from './controller-project-species-all'
import { projectSpeciesOneHandler } from './controller-project-species-one'
import { projectSpeciesPredictedOccupancyHandler } from './controller-project-species-predicted-occupancy'

export const mockPredictionsFolderName = (projectSlug: string): string => `predicted-occupancy/${projectSlug}`
export const mockPredictionsFolderPath = (projectSlug: string): string => resolve('./public', mockPredictionsFolderName(projectSlug))

export const routesSpecies: RouteRegistration[] = [
  {
    method: GET,
    url: projectSpeciesOneRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: projectSpeciesOneHandler
  },
  {
    method: GET,
    url: projectSpeciesRoute,
    handler: projectSpeciesHandler
  },
  {
    method: GET,
    url: projectSpeciesPredictedOccupancyRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: projectSpeciesPredictedOccupancyHandler
  }
]
