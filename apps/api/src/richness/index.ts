import { richnessDatasetRoute } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { verifyProjectUserPermission } from '../_services/decorators'
import { richnessDatasetHandler } from './richness-dataset-handler'

export const routesRichness: RouteRegistration[] = [
  {
    method: GET,
    url: richnessDatasetRoute,
    handler: richnessDatasetHandler,
    preHandler: [
      verifyProjectUserPermission
    ]
  }
]
