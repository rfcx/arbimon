import { richnessDatasetRoute } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { richnessExportRoute } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { setIsProjectMember } from '@/_middleware/get-is-project-member'
import { GET, RouteRegistration } from '../_services/api-helpers/types'
import { richnessDatasetHandler } from './richness-dataset-handler'
import { richnessExportHandler } from './richness-export-handler'

export const routesRichness: RouteRegistration[] = [
  {
    method: GET,
    url: richnessDatasetRoute,
    preHandler: [setIsProjectMember],
    handler: richnessDatasetHandler
  },
  {
    method: GET,
    url: richnessExportRoute,
    preHandler: [setIsProjectMember],
    handler: richnessExportHandler
  }
]
