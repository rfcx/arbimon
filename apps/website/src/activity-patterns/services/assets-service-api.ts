import { coreMediaUrl } from '@rfcx-bio/common/api-bio/media/core-media'
import { speciesPredictionOccupancyGeneratedUrl } from '@rfcx-bio/common/api-bio/species/species-prediction-occupancy'

import { apiClient } from '~/api'
import { useStore } from '~/store'

export class AssetsService {
  constructor (private readonly baseUrl: string) {}

  async getMedia (mediaUrl: string): Promise<Blob | undefined> {
    const url = `${this.baseUrl}${coreMediaUrl()}?url=${mediaUrl}`
    return await apiClient.getOrUndefined<Blob>(url, { responseType: 'blob' })
  }

  async getPredictedOccupancyMapImage (speciesSlug: string, filenameWithoutExtension: string): Promise<Blob | undefined> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (projectId === undefined) return undefined

    const url = `${this.baseUrl}${speciesPredictionOccupancyGeneratedUrl({ projectId: projectId.toString(), speciesSlug, filenameWithoutExtension })}`
    return await apiClient.getOrUndefined<Blob>(url, { responseType: 'blob' })
  }
}
