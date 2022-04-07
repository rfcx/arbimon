import { resolve } from 'path'

import { projectSpeciesAllRoute } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { projectSpeciesFileRoute } from '@rfcx-bio/common/api-bio/species/project-species-file'
import { projectSpeciesOneRoute } from '@rfcx-bio/common/api-bio/species/project-species-one'

import { setIsProjectMember } from '@/_middleware/get-is-project-member'
import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { projectSpeciesAllHandler } from './controller-project-species-all'
import { projectSpeciesFileHandler } from './controller-project-species-file'
import { projectSpeciesOneHandler } from './controller-project-species-one'

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
    url: projectSpeciesFileRoute,
    preHandler: [setIsProjectMember],
    handler: projectSpeciesFileHandler
  }
]
