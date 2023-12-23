import { richnessDatasetRoute } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { richnessExportRoute } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { requireProjectPermission } from '@/_hooks/require-permission'
import { type RouteRegistration, GET } from '../_services/api-helpers/types'
import { richnessDatasetHandler } from './richness-dataset-handler'
import { richnessExportHandler } from './richness-export-handler'

export const routesRichness: RouteRegistration[] = [
  {
    method: GET,
    url: richnessDatasetRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: richnessDatasetHandler
  },
  {
    method: GET,
    url: richnessExportRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: richnessExportHandler
  }
]
