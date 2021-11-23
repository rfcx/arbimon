import axios from 'axios'

import { IUCNSummary } from '~/api/iucn-service/types'
import { Endpoint } from '~/api-helpers/rest'

export class IUCNService {
  constructor (private readonly baseUrl: string) {}

  async getSpeciesSummary (sciencetificName: string): Promise<IUCNSummary | undefined> {
    // Extract species from sub species name
    const extractedGenusAndSpecies = sciencetificName.split(' ').slice(0, 2)
    const speciesName = extractedGenusAndSpecies.join(' ')

    const endpoint: Endpoint = ({
      method: 'GET',
      url: `${this.baseUrl}/iucn/info/${speciesName}`
    })

    try {
      const { data } = await axios.request<IUCNSummary>(endpoint)
      return data
    } catch (e) {
      return undefined
    }
  }
}
