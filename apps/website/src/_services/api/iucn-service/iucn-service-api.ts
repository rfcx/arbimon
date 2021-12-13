import axios, { AxiosRequestConfig } from 'axios'

import { IUCNSummary } from '~/api/iucn-service/types'

export class IUCNService {
  constructor (private readonly baseUrl: string) {}

  async getSpeciesSummary (arbimonScientificName: string): Promise<IUCNSummary | undefined> {
    // Extract species from sub species name
    const extractedGenusAndSpecies = arbimonScientificName.split(' ').slice(0, 2)
    const scientificName = extractedGenusAndSpecies.join(' ')

    const endpoint: AxiosRequestConfig = ({
      method: 'GET',
      url: `${this.baseUrl}/iucn/info/${scientificName}`
    })

    try {
      const { data } = await axios.request<IUCNSummary>(endpoint)
      return data
    } catch (e) {
      return undefined
    }
  }
}
