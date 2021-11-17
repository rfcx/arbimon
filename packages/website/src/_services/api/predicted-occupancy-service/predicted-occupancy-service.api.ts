import axios from 'axios'

import { Endpoint } from '~/api-helpers/rest'
import { GetPredictedOccupancyMaps, PredictedOccupancyMap } from './types'

// TODO ??? - Extract API types to common
interface ProjectSpeciesRouteResponse {
  predictedOccupancyMaps: PredictedOccupancyMap[]
}

const bioApiHost: string = import.meta.env.VITE_BIO_API_HOST // TODO ??? - Fix @typescript/eslint so it picks up vite-env.d.ts

export const getPredictedOccupancyMaps: GetPredictedOccupancyMaps = async (speciesSlug: string): Promise<PredictedOccupancyMap[]> => {
  // Check slug exists
  if (!speciesSlug) return []

  try {
    // Call API
    const url = `${bioApiHost}/projects/123/species/${speciesSlug}`
    const endpoint: Endpoint = ({ method: 'GET', url })
    const { data } = await axios.request<ProjectSpeciesRouteResponse>(endpoint)

    // Prepend baseUrl
    return data.predictedOccupancyMaps.map(({ title, url }) => ({
      title,
      url: `${bioApiHost}${url}`
    }))
  } catch (e) {
    console.log(e)
    return []
  }
}
