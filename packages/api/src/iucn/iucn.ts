import axios from 'axios'
import * as dotenv from 'dotenv'
import { IUCNNarrativeInfoResponse, IUCNNarrativeInfoResultResponse, IUCNSummary } from 'iucn/types'
import { Endpoint } from 'services/api-helper/types'

import { APIError } from '../services/errors/types.js'

dotenv.config()

const TOKEN = process.env.IUCN_TOKEN ?? ''
const IUCN_BASE_URL = process.env.IUCN_BASE_URL ?? ''

export async function getSpeciesSummary (speciesName: string): Promise<IUCNSummary | undefined> {
  const information = await getSpeciesInformation(speciesName)

  if (!information) {
    throw new APIError('Species not found', 404)
  }

  const redirectUrl = `${IUCN_BASE_URL}/website/${speciesName}`
  return { content: information?.habitat ?? information?.rationale ?? '', redirectUrl }
}

async function getSpeciesInformation (speciesName: string): Promise<IUCNNarrativeInfoResultResponse | undefined> {
  const endpoint: Endpoint = ({
    method: 'GET',
    url: `${IUCN_BASE_URL}/species/narrative/${speciesName}?token=${TOKEN}`
  })

  const { data } = await axios.request<IUCNNarrativeInfoResponse>(endpoint)
  return data.result.length === 0 ? undefined : data.result[0]
}
