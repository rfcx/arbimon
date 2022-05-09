import { projectSpeciesAllGeneratedUrl, ProjectSpeciesAllResponse } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { PredictedOccupancyMap, projectSpeciesOneGeneratedUrl, ProjectSpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { SpotlightDatasetResponse, spotlightDatasetUrl } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { TaxonSpeciesCallLight, TaxonSpeciesPhotoLight } from '@rfcx-bio/common/dao/types'
import { SpeciesInProject, SpeciesInProjectLight } from '@rfcx-bio/common/dao/types/species-in-project'

import { apiClient } from '~/api'
import { DetectionFilter, generateFilterQuery } from '~/filters'
import { useStore } from '~/store'

export interface ProjectSpecies {
  speciesInformation: SpeciesInProject | undefined
  speciesPhotos: TaxonSpeciesPhotoLight[]
  speciesCalls: TaxonSpeciesCallLight[]
  predictedOccupancyMaps: PredictedOccupancyMap[]
}

export class SpotlightService {
  constructor (private readonly baseUrl: string) {}

  async getSpeciesOne (speciesSlug: string): Promise<ProjectSpecies | undefined> {
    if (!speciesSlug) return undefined

    const store = useStore()
    const projectId = store.selectedProject?.id
    if (projectId === undefined) return undefined

    const url = `${this.baseUrl}${projectSpeciesOneGeneratedUrl({ projectId: projectId.toString(), speciesSlug })}`
    const data = await apiClient.getOrUndefined<ProjectSpeciesOneResponse>(url)

    return {
      speciesInformation: data?.speciesInformation,
      speciesPhotos: data?.speciesPhotos ?? [],
      speciesCalls: data?.speciesCalls ?? [],
      predictedOccupancyMaps: data?.predictedOccupancyMaps ?? []
    }
  }

  async getSpeciesAll (): Promise<SpeciesInProjectLight[] | undefined> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (projectId === undefined) return undefined

    const url = `${this.baseUrl}${projectSpeciesAllGeneratedUrl({ projectId: projectId.toString() })}`
    const resp = await apiClient.getOrUndefined<ProjectSpeciesAllResponse>(url)
    return resp?.species
  }

  async getSpotlightDataset (rawFilter: DetectionFilter, speciesId: number): Promise<SpotlightDatasetResponse | undefined> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (projectId === undefined) return undefined

    const query = `${generateFilterQuery(rawFilter)}&speciesId=${speciesId}`
    const url = `${this.baseUrl}${spotlightDatasetUrl({ projectId: projectId.toString() })}?${query}`
    const resp = await apiClient.getOrUndefined<SpotlightDatasetResponse>(url)

    return resp
  }
}
