import axios from 'axios'
import { GoogleAuth } from 'google-auth-library'

import { type ArbiResponseData, type ArbiSessionData, type ArbiUserQuestionParams, type ArbiUserSessionParams } from '@rfcx-bio/common/api-arbimon/arbi-assistant'

import { unpackAxiosError } from '../api-helpers/axios-errors'
import { env } from '../env'

const ARBI_ASSISTANT_BASE_URL = env.ARBI_ASSISTANT_BASE_URL

const keysEnvVar = process.env.ARBI_ASSISTANT_SERVICE_ACCOUNT
if (!keysEnvVar) {
  throw new Error('The $CREDS environment variable was not found!')
}
const credentials = JSON.parse(keysEnvVar)

const auth = new GoogleAuth({ credentials })
const client = await auth.getIdTokenClient(ARBI_ASSISTANT_BASE_URL)
const idToken = await client.idTokenProvider.fetchIdToken(ARBI_ASSISTANT_BASE_URL)

export async function getArbiAssistantSessionFromApi (userData: ArbiUserSessionParams): Promise<ArbiSessionData> {
  console.info('ARBI_ASSISTANT_BASE_URL', ARBI_ASSISTANT_BASE_URL, idToken)
  try {
    const response = await axios.request({
      method: 'POST',
      url: `${ARBI_ASSISTANT_BASE_URL}/apps/arbimon_assistant/users/${userData.userId}/sessions`,
      headers: {
        authorization: `Bearer ${idToken}`
      }
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
      headers: {
        authorization: `Bearer ${idToken}`
      },
      data
    })

    return response.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}
