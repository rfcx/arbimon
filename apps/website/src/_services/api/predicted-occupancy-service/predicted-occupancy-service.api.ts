import axios, { AxiosRequestConfig } from 'axios'

import { useStore } from '~/store'
import { GetPredictedOccupancyMaps, PredictedOccupancyMap } from './types'

// TODO ??? - Extract API types to common
interface ProjectSpeciesRouteResponse {
  predictedOccupancyMaps: PredictedOccupancyMap[]
}

const bioApiHost: string = import.meta.env.VITE_BIO_API_HOST // TODO ??? - Fix @typescript/eslint so it picks up vite-env.d.ts

export const getPredictedOccupancyMaps: GetPredictedOccupancyMaps = async (speciesSlug: string): Promise<PredictedOccupancyMap[]> => {
  // Check slug exists
  if (!speciesSlug) return []

  // Check project exists
  const store = useStore()
  const projectId = store.selectedProject?.id
  if (!projectId) return []

  try {
    // Call API
    const url = `${bioApiHost}/projects/${projectId}/species/${speciesSlug}`
    const endpoint: AxiosRequestConfig = ({ method: 'GET', url })
    const { data } = await axios.request<ProjectSpeciesRouteResponse>(endpoint)

    // Prepend baseUrl
    return data.predictedOccupancyMaps.map(({ title, url }) => ({
      title,
      url: `${bioApiHost}${url}`
    }))
  } catch (e) {
    return []
  }
}
