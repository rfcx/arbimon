import { richnessDatasetRoute } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { richnessByExportRoute } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { verifyProjectUserPermission } from '../_services/decorators'
import { RichnessDatasetHandler } from './controller-richness-dataset'
import { RichnessExportHandler } from './controller-richness-export'

export const routesRichness: RouteRegistration[] = [
  {
    method: GET,
    url: richnessDatasetRoute,
    handler: RichnessDatasetHandler,
    preHandler: [
      verifyProjectUserPermission
    ]
  },
  {
    method: GET,
    url: richnessByExportRoute,
    handler: RichnessExportHandler,
    preHandler: [
      verifyProjectUserPermission
    ]
  }
]
