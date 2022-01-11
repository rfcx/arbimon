import { ProjectSpeciesRouteResponse } from '@rfcx-bio/common/api-bio/species/project-species'

import { apiClient } from '~/api'
import { useStore } from '~/store'

const BIO_API_BASE_URL: string = import.meta.env.VITE_BIO_API_BASE_URL // TODO ??? - Fix @typescript/eslint so it picks up vite-env.d.ts

export class SpotlightService {
  async getSpeciesInformation (speciesSlug: string): Promise<ProjectSpeciesRouteResponse | undefined> {
    if (!speciesSlug) return undefined

    const store = useStore()
    const projectId = store.selectedProject?.id
    if (!projectId) return undefined

    const url = `${BIO_API_BASE_URL}/projects/${projectId}/species/${speciesSlug}`
    const data = await apiClient.getOrUndefined<ProjectSpeciesRouteResponse>(url)
    return {
      speciesInformation: data?.speciesInformation,
      predictedOccupancyMaps: data?.predictedOccupancyMaps.map(({ title, url }) => ({
        title,
        url: `${BIO_API_BASE_URL}${url}`
      })) ?? []
    }
  }
}
