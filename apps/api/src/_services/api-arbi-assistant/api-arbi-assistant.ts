import axios from 'axios'

import { type ArbiResponseData, type ArbiSessionData, type ArbiUserQuestionParams } from '@rfcx-bio/common/src/api-arbimon/arbi-assistant'

import { unpackAxiosError } from '../api-helpers/axios-errors'

export async function getArbiAssistantSessionFromApi (userId: string): Promise<ArbiSessionData> {
  try {
    const response = await axios.request({
      method: 'POST',
      url: `/apps/arbimon_assistant/users/${userId}/sessions`
    })

    return response.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function postArbiAssistantQuestion (token: string, data: ArbiUserQuestionParams): Promise<ArbiResponseData> {
  try {
    const response = await axios.request({
      method: 'POST',
      url: '/run',
      data
    })

    return response.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}
