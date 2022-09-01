import { AxiosInstance } from 'axios'

// import { apiGetOrUndefined } from '@rfcx-bio/utils/api'
import { PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers'

// Request type
export type DetectSummaryParams = ProjectRouteParamsSerialized
export interface DetectSummaryQueryParams {
  jobId: string | string[]
  limit: number
  offset: number
}

// Response type
export interface SpeciesDetectionSummary {
  speciesSlug: string
  speciesName: string
  numberOfDetections: number
}

export interface DetectionSummaryResponse {
  total: number
  currentPage: number
  results: SpeciesDetectionSummary[]
}

// Route
export const detectSummaryRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/detect-summary`

// Service
export const apiBioGetDetectSummaryData = async (apiClient: AxiosInstance, projectId: string, params: DetectSummaryQueryParams): Promise<DetectionSummaryResponse | undefined> => {
  // return await apiGetOrUndefined(apiClient, `/projects/${projectId}/detect-summary/${params.jobId}`)

  return {
    total: 9,
    currentPage: 0,
    results: [
      {
        speciesSlug: 'panthera-pardus-orientalis',
        speciesName: 'Panthera pardus orientalis',
        numberOfDetections: 1
      },
      {
        speciesSlug: 'diceros-bicornis',
        speciesName: 'Diceros bicornis',
        numberOfDetections: 0
      },
      {
        speciesSlug: 'pongo-pygmaeus',
        speciesName: 'Pongo pygmaeus',
        numberOfDetections: 0
      },
      {
        speciesSlug: 'gorilla-gorilla-diehli',
        speciesName: 'Gorilla gorilla diehli',
        numberOfDetections: 1
      },
      {
        speciesSlug: 'gorilla-beringei-graueri',
        speciesName: 'Gorilla beringei graueri',
        numberOfDetections: 0
      },
      {
        speciesSlug: 'eretmochelys-imbricata',
        speciesName: 'Eretmochelys imbricata',
        numberOfDetections: 1
      },
      {
        speciesSlug: 'rhinoceros-sondaicus',
        speciesName: 'Rhinoceros sondaicus',
        numberOfDetections: 2
      },
      {
        speciesSlug: 'pseudoryx-nghetinhensis',
        speciesName: 'Pseudoryx nghetinhensis',
        numberOfDetections: 1
      },
      {
        speciesSlug: 'elephas-maximus-sumatranus',
        speciesName: 'Elephas maximus sumatranus',
        numberOfDetections: 1
      }
    ]
  }
}
