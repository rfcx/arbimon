import axios from 'axios'

import { IUCNNarrativeInfoResponse, IUCNNarrativeInfoResultResponse } from '~/api/iucn-service'
import { IUCNSummary } from '~/api/iucn-service/types'
import { Endpoint } from '~/api-helpers/rest'

const TOKEN = import.meta.env.VITE_APP_IUCN_TOKEN as string ?? ''

export class IUCNService {
  constructor (private readonly baseUrl: string) {}

  async getSpeciesSummary (sciencetificName: string): Promise<IUCNSummary | undefined> {
    // Extract species from sub species name
    const extractedGenusAndSpecies = sciencetificName.split(' ').slice(0, 2)
    const speciesName = extractedGenusAndSpecies.join(' ')

    try {
      const information = await this.getSpeciesInformation(speciesName)
      const redirectUrl = `${this.baseUrl}/website/${speciesName}`
      return { content: information?.habitat ?? '', redirectUrl }
    } catch (e) {
      // TODO #191: API Handle
      return undefined
    }
  }

  async getSpeciesInformation (speciesName: string): Promise<IUCNNarrativeInfoResultResponse | undefined> {
    try {
      const endpoint: Endpoint = ({
        method: 'GET',
        url: `${this.baseUrl}/species/narrative/${speciesName}?token=${TOKEN}`
      })

      const { data } = await axios.request<IUCNNarrativeInfoResponse>(endpoint)
      return data.result.length === 0 ? undefined : data.result[0]
    } catch {
      return undefined
    }
  }
}
