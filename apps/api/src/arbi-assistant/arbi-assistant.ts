import { type ArbiResponseData, type ArbiSessionData, type ArbiUserQuestionParams, type ArbiUserSessionParams } from '@rfcx-bio/common/api-arbimon/arbi-assistant'

import { getArbiAssistantSessionFromApi, postArbiAssistantQuestion } from '../_services/api-arbi-assistant/api-arbi-assistant'
import type { Handler } from '../_services/api-helpers/types'

export const getArbiAssistantSessionHandler: Handler<ArbiSessionData, unknown, unknown, ArbiUserSessionParams> = async (req, res) => {
  const data = await getArbiAssistantSessionFromApi(req.body)
  return await res.send(data)
}

export const postArbiAssistantQuestionHandler: Handler<ArbiResponseData, unknown, unknown, ArbiUserQuestionParams> = async (req, res) => {
  const data = await postArbiAssistantQuestion(req.body)
  return await res.send(data)
}
