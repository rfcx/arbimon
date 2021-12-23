import axios, { AxiosRequestConfig } from 'axios'

import { PredictedOccupancyMap, ProjectSpeciesRouteResponse } from '@rfcx-bio/common/api-bio/species/project-species'

import { useStore } from '~/store'

const BIO_API_HOST: string = import.meta.env.VITE_BIO_API_HOST // TODO ??? - Fix @typescript/eslint so it picks up vite-env.d.ts

export const getPredictedOccupancyMaps = async (speciesSlug: string): Promise<PredictedOccupancyMap[]> => {
  // Check slug exists
  if (!speciesSlug) return []

  // Check project exists
  const store = useStore()
  const projectId = store.selectedProject?.id
  if (!projectId) return []

  try {
    // Call API
    const url = `${BIO_API_HOST}/projects/${projectId}/species/${speciesSlug}`
    const endpoint: AxiosRequestConfig = ({ method: 'GET', url })
    const { data } = await axios.request<ProjectSpeciesRouteResponse>(endpoint)

    // Prepend baseUrl
    return data.predictedOccupancyMaps.map(({ title, url }) => ({
      title,
      url: `${BIO_API_HOST}${url}`
    }))
  } catch (e) {
    return []
  }
}
