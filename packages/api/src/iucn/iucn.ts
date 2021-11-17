import axios from 'axios'
import { BASE_IUCN_URL } from 'iucn/env'
import { IUCNNarrativeInfoResponse, IUCNNarrativeInfoResultResponse, IUCNSummary } from 'iucn/types'
import { Endpoint } from 'services/api-helper/types'

// TODO: Update secret
const TOKEN = 'abc'

export async function getSpeciesSummary (sciencetificName: string): Promise<IUCNSummary | undefined> {
  // Extract species from sub species name
  const extractedGenusAndSpecies = sciencetificName.split(' ').slice(0, 2)
  const speciesName = extractedGenusAndSpecies.join(' ')

  try {
    const information = await getSpeciesInformation(speciesName)
    const redirectUrl = `${BASE_IUCN_URL}/website/${speciesName}`
    return { content: information?.habitat ?? information?.rationale ?? '', redirectUrl }
  } catch (e) {
    // TODO #191: API Handle
    return undefined
  }
}

async function getSpeciesInformation (speciesName: string): Promise<IUCNNarrativeInfoResultResponse | undefined> {
  try {
    const endpoint: Endpoint = ({
      method: 'GET',
      url: `${BASE_IUCN_URL}/species/narrative/${speciesName}?token=${TOKEN}`
    })

    const { data } = await axios.request<IUCNNarrativeInfoResponse>(endpoint)
    return data.result.length === 0 ? undefined : data.result[0]
  } catch {
    return undefined
  }
}
