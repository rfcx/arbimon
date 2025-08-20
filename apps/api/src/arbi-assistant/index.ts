import { arbiAssistantQuestionRoute, arbiAssistantSessionRoute } from '@rfcx-bio/common/src/api-arbimon/arbi-assistant'

import { type RouteRegistration, POST } from '../_services/api-helpers/types'
import { getArbiAssistantSessionHandler, postArbiAssistantQuestionHandler } from './arbi-assistant'

export const routesArbiAssistant: RouteRegistration[] = [
  {
    method: POST,
    url: arbiAssistantSessionRoute,
    handler: getArbiAssistantSessionHandler
  },
  {
    method: POST,
    url: arbiAssistantQuestionRoute,
    handler: postArbiAssistantQuestionHandler
  }
]
