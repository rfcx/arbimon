import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef, computed } from 'vue'

import { type DashboardSpeciesByRiskDataResponse, type DashboardSpeciesByRiskParams, apiBioGetDashboardSpeciesByRiskDataRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-by-risk'
import { type DashboardSpeciesDataParams, type DashboardSpeciesDataResponse, apiBioGetDashboardSpeciesDataRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-data'

import { useStoreOutsideSetup } from '~/store'

const store = useStoreOutsideSetup()
const projectId = computed(() => store.selectedProject?.id)

const options = {
  // The time in milliseconds after data is considered stale. (before it is refetched)
  staleTime: 10 * 60 * 1000 // 10 minutes
}

export const useSpeciesRichnessByRisk = (apiClient: AxiosInstance): UseQueryReturnType<DashboardSpeciesDataResponse, unknown> =>
  useQuery({
    queryKey: ['fetch-species-data', projectId],
    queryFn: async () => {
      if (projectId.value === undefined) return { richnessByRisk: [] }
      const params: DashboardSpeciesDataParams = { projectId: projectId.value.toString() }
      return await apiBioGetDashboardSpeciesDataRoute(apiClient, params) ?? []
    },
    ...options
  })

export const useSpeciesByRisk = (apiClient: AxiosInstance, riskRatingId: ComputedRef<number | null>): UseQueryReturnType<DashboardSpeciesByRiskDataResponse, unknown> =>
  useQuery({
    queryKey: ['fetch-species-by-risk', projectId, riskRatingId, { enabled: false }],
    queryFn: async () => {
      if (projectId.value === undefined || riskRatingId.value === undefined || riskRatingId.value === null) return { species: [] }
      const params: DashboardSpeciesByRiskParams = { projectId: projectId.value.toString() }
      return await apiBioGetDashboardSpeciesByRiskDataRoute(apiClient, params, { riskRatingId: riskRatingId.value?.toString() ?? '0' }) ?? []
    },
    ...options
  })
