import axios from 'axios'
import * as dotenv from 'dotenv'
import { IUCNNarrativeInfoResponse, IUCNNarrativeInfoResultResponse, IUCNSummary } from 'iucn/types'
import { Endpoint } from 'services/api-helper/types'

dotenv.config()

const TOKEN = process.env.IUCN_TOKEN ?? ''
const IUCN_BASE_URL = process.env.IUCN_BASE_URL ?? ''

export async function getSpeciesSummary (speciesName: string): Promise<IUCNSummary | undefined> {
  try {
    const information = await getSpeciesInformation(speciesName)

    if (!information) {
      return undefined
    }

    const redirectUrl = `${IUCN_BASE_URL}/website/${speciesName}`
    return { content: information?.habitat ?? information?.rationale ?? '', redirectUrl }
  } catch (e) {
    console.error('IUCN:', e)
    return undefined
  }
}

async function getSpeciesInformation (speciesName: string): Promise<IUCNNarrativeInfoResultResponse | undefined> {
  const endpoint: Endpoint = ({
    method: 'GET',
    url: `${IUCN_BASE_URL}/species/narrative/${speciesName}?token=${TOKEN}`
  })

  const { data } = await axios.request<IUCNNarrativeInfoResponse>(endpoint)

  return data.result.length === 0 ? undefined : data.result[0]
}
