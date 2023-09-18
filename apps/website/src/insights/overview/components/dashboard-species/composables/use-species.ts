import { type AxiosInstance } from 'axios'
import { computed } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DashboardSpeciesDataParams, type DashboardSpeciesDataResponse, apiBioGetDashboardSpeciesDataRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-data'

import { useStoreOutsideSetup } from '~/store'

const store = useStoreOutsideSetup()
const projectId = computed(() => store.selectedProject?.id)

export const useSpecies = (apiClient: AxiosInstance): UseQueryReturnType<DashboardSpeciesDataResponse, unknown> =>
  useQuery(['fetch-species', projectId], async () => {
    if (projectId.value === undefined) return { species: [] }

    const params: DashboardSpeciesDataParams = { projectId: projectId.value.toString() }
    return await apiBioGetDashboardSpeciesDataRoute(apiClient, params) ?? []
  })
