import { Species, SpeciesLight } from '@rfcx-bio/common/api-bio/species/common'
import { projectSpeciesAllGeneratedUrl, ProjectSpeciesAllResponse } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { PredictedOccupancyMap, projectSpeciesOneGeneratedUrl, ProjectSpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { SpotlightDatasetResponse, spotlightDatasetUrl } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'

import { apiClient } from '~/api'
import { DatasetParameters } from '~/filters'
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

  async getSpotlightDataset (rawFilter: DatasetParameters, speciesId: number): Promise<SpotlightDatasetResponse | undefined> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (!projectId) return undefined

    const filter = {
      speciesId,
      startDate: rawFilter.startDate.toISOString(),
      endDate: rawFilter.endDate.toISOString(),
      siteIds: rawFilter.sites.map(({ id }) => id),
      taxons: rawFilter.otherFilters.filter(({ propertyName }) => propertyName === 'taxon').map(({ value }) => value)
    }
    const query = Object.entries(filter).map(([key, value]) => `${key}=${value.toString()}`).join('&')
    const url = `${this.baseUrl}${spotlightDatasetUrl({ projectId })}?${query}`
    const resp = await apiClient.getOrUndefined<SpotlightDatasetResponse>(url)

    return resp
  }
}
