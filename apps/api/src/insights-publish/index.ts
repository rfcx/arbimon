import { getInsightsPublishStatusRoute, updateInsightsPublishStatusRoute } from '@rfcx-bio/common/api-bio/insights-publish-status/insights-publish-status'

import { type RouteRegistration, GET, PATCH } from '~/api-helpers/types'
import { getInsightsPublishStatusHandler } from './get-insights-publish-status-handler'
import { patchInsightsPublishStatusHandler } from './patch-insights-publish-status-handler'

export const routesInsightsPublish: RouteRegistration[] = [
  {
    method: GET,
    url: getInsightsPublishStatusRoute,
    handler: getInsightsPublishStatusHandler
  },
  {
    method: PATCH,
    url: updateInsightsPublishStatusRoute,
    handler: patchInsightsPublishStatusHandler
  }
]
