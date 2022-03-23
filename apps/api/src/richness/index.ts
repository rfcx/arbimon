import { richnessDatasetRoute } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

import { loadIsProjectMember } from '@/_middleware/get-is-project-member'
import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { richnessDatasetHandler } from './richness-dataset-handler'

export const routesRichness: RouteRegistration[] = [
  {
    method: GET,
    url: richnessDatasetRoute,
    preHandler: [loadIsProjectMember],
    handler: richnessDatasetHandler
  }
]
