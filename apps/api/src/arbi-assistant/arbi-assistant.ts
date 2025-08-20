import type { FastifyReply } from 'fastify'

import { type ArbiUserQuestionParams } from '@rfcx-bio/common/src/api-arbimon/arbi-assistant'

import { getArbiAssistantSessionFromApi, postArbiAssistantQuestion } from '../_services/api-arbi-assistant/api-arbi-assistant'
import type { Handler } from '../_services/api-helpers/types'
import { assertQueryParamsExist } from '../_services/validation'

export const getArbiAssistantSessionHandler: Handler<FastifyReply, unknown, string> = async (req, res) => {
  const userId = req.query
  assertQueryParamsExist({ userId })
  const data = await getArbiAssistantSessionFromApi(userId)
  return await res.send(data)
}

export const postArbiAssistantQuestionHandler: Handler<FastifyReply, unknown, ArbiUserQuestionParams> = async (req, res) => {
  const data = await postArbiAssistantQuestion(req.headers.authorization ?? '', req.params as ArbiUserQuestionParams)
  return await res.send(data)
}
