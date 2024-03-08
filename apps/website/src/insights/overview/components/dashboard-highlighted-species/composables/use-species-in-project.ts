import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type ProjectSpeciesAllResponse, type ProjectSpeciesQueryParams, apiBioGetProjectSpeciesAll } from '@rfcx-bio/common/api-bio/species/project-species-all'

export const apiBioGetProjectSpecies = async (apiClient: AxiosInstance, locationProjectId: ComputedRef<number | undefined>, params: ProjectSpeciesQueryParams = {}): Promise<ProjectSpeciesAllResponse | undefined> =>
  await apiBioGetProjectSpeciesAll(apiClient, locationProjectId?.value ?? -1, params)
