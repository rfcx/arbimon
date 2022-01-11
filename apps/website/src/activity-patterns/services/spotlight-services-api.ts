import { Species } from '@rfcx-bio/common/api-bio/species/common'
import { PredictedOccupancyMap, projectSpeciesOneGeneratedUrl, ProjectSpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/project-species-one'

import { apiClient } from '~/api'
import { useStore } from '~/store'

export interface ProjectSpecies {
  speciesInformation: Species | undefined
  predictedOccupancyMaps: PredictedOccupancyMap[]
}

export class SpotlightService {
  constructor (private readonly baseUrl: string) {}

  async getSpeciesInformation (speciesSlug: string): Promise<ProjectSpecies | undefined> {
    if (!speciesSlug) return undefined

    const store = useStore()
    const projectId = store.selectedProject?.id
    if (!projectId) return undefined

    const url = `${this.baseUrl}${projectSpeciesOneGeneratedUrl({ projectId, speciesSlug })}`
    const data = await apiClient.getOrUndefined<ProjectSpeciesOneResponse>(url)
    return {
      speciesInformation: data?.speciesInformation,
      predictedOccupancyMaps: data?.predictedOccupancyMaps.map(({ title, url }) => ({
        title,
        url: `${this.baseUrl}${url}`
      })) ?? []
    }
  }
}
