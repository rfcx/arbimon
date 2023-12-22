import { syncHistoryRoute } from '@rfcx-bio/common/api-bio/sync/sync-history'

import { requireProjectPermission } from '@/_middleware/require-permission'
import { syncHistoryHandler } from '@/sync/sync-history-handler'
import { type RouteRegistration, GET } from '~/api-helpers/types'

export const routesSync: RouteRegistration[] = [
  {
    method: GET,
    url: syncHistoryRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: syncHistoryHandler
  }
]
