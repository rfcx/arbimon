import { RichnessExportHandler } from 'richness/controller-richness-export'

import { richnessDatasetRoute } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { richnessByExportRoute } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { GET, RouteRegistration } from '../_services/api-helper/types'
import { verifyProjectUserPermission } from '../_services/decorators'
import { RichnessDatasetHandler } from './controller-richness-dataset'

export const routesRichness: RouteRegistration[] = [
  {
    method: GET,
    url: richnessDatasetRoute,
    handler: RichnessDatasetHandler
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
