import { syncHistoryRoute } from '@rfcx-bio/common/api-bio/sync/sync-history'

import { setIsProjectMember } from '@/_middleware/get-is-project-member'
import { syncHistoryHandler } from '@/sync/sync-history-handler'
import { type RouteRegistration, GET } from '~/api-helpers/types'

export const routesSync: RouteRegistration[] = [
  {
    method: GET,
    url: syncHistoryRoute,
    preHandler: [setIsProjectMember],
    handler: syncHistoryHandler
  }
]
