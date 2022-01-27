import { richnessDatasetRoute } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

import { GET, RouteRegistration } from '../_services/api-helper/types'
import { verifyProjectUserPermission } from '../_services/decorators'
import { RichnessHandler } from './controller-richness-dataset'

export const routesRichness: RouteRegistration[] = [
  {
    method: GET,
    url: richnessDatasetRoute,
    handler: RichnessHandler,
    preHandler: [
      verifyProjectUserPermission
    ]
  }
]
