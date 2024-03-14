import { getClassifierJobsRoute } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'

import { requireProjectPermission } from '@/_hooks/require-permission'
import { requireRfcxEmail } from '@/_hooks/require-rfcx-user'
import { type RouteRegistration, GET } from '~/api-helpers/types'
import { getClassifierJobsHandler } from './get-classifier-jobs-handler'

export const routesCnn: RouteRegistration[] = [
  {
    method: GET,
    url: getClassifierJobsRoute,
    preHandler: [requireProjectPermission('read-cnn'), requireRfcxEmail],
    handler: getClassifierJobsHandler
  }
]
