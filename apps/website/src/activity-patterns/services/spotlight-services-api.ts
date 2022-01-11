import { Species, SpeciesLight } from '@rfcx-bio/common/api-bio/species/common'
import { projectSpeciesAllGeneratedUrl, ProjectSpeciesAllResponse } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { PredictedOccupancyMap, projectSpeciesOneGeneratedUrl, ProjectSpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/project-species-one'

import { apiClient } from '~/api'
import { useStore } from '~/store'

export interface ProjectSpecies {
  speciesInformation: Species | undefined
  predictedOccupancyMaps: PredictedOccupancyMap[]
}

export class SpotlightService {
  constructor (private readonly baseUrl: string) {}

  async getSpeciesOne (speciesSlug: string): Promise<ProjectSpecies | undefined> {
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

  async getSpeciesAll (): Promise<SpeciesLight[] | undefined> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (!projectId) return undefined

    const url = `${this.baseUrl}${projectSpeciesAllGeneratedUrl({ projectId })}`
    const resp = await apiClient.getOrUndefined<ProjectSpeciesAllResponse>(url)
    return resp?.species
  }
}
