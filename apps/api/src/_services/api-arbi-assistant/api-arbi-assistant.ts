import axios from 'axios'

import { type ArbiResponseData, type ArbiSessionData, type ArbiUserQuestionParams, type ArbiUserSessionParams } from '@rfcx-bio/common/api-arbimon/arbi-assistant'

import { unpackAxiosError } from '../api-helpers/axios-errors'
import { env } from '../env'

const ARBI_ASSISTANT_BASE_URL = env.ARBI_ASSISTANT_BASE_URL

export async function getArbiAssistantSessionFromApi (userData: ArbiUserSessionParams): Promise<ArbiSessionData> {
  try {
    const response = await axios.request({
      method: 'POST',
      url: `${ARBI_ASSISTANT_BASE_URL}/apps/arbimon_assistant/users/${userData.userId}/sessions`
    })

    return response.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function postArbiAssistantQuestion (data: ArbiUserQuestionParams): Promise<ArbiResponseData> {
  try {
    const response = await axios.request({
      method: 'POST',
      url: `${ARBI_ASSISTANT_BASE_URL}/run`,
      data
    })

    return response.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}
