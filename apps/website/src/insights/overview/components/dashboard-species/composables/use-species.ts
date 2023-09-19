import { type AxiosInstance } from 'axios'
import { computed } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DashboardSpeciesByRiskDataResponse, type DashboardSpeciesByRiskParams, apiBioGetDashboardSpeciesByRiskDataRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-by-risk'
import { type DashboardSpeciesDataParams, type DashboardSpeciesDataResponse, apiBioGetDashboardSpeciesDataRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-data'
import { type DashboardSpeciesRichnessByRiskDataResponse, apiBioGetDashboardSpeciesRichnessByRiskDataRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-richness-by-risk'

import { useStoreOutsideSetup } from '~/store'

const store = useStoreOutsideSetup()
const projectId = computed(() => store.selectedProject?.id)

export const useSpecies = (apiClient: AxiosInstance): UseQueryReturnType<DashboardSpeciesDataResponse, unknown> =>
  useQuery(['fetch-species', projectId], async () => {
    if (projectId.value === undefined) return { species: [] }

    const params: DashboardSpeciesDataParams = { projectId: projectId.value.toString() }
    return await apiBioGetDashboardSpeciesDataRoute(apiClient, params) ?? []
  })

export const useSpeciesRichnessByRisk = (apiClient: AxiosInstance): UseQueryReturnType<DashboardSpeciesRichnessByRiskDataResponse, unknown> =>
  useQuery(['fetch-species-richness-by-risk', projectId], async () => {
    if (projectId.value === undefined) return { richnessByRisk: [] }

    const params: DashboardSpeciesDataParams = { projectId: projectId.value.toString() }
    return await apiBioGetDashboardSpeciesRichnessByRiskDataRoute(apiClient, params) ?? []
  })

  export const useSpeciesByRisk = (apiClient: AxiosInstance, riskRatingId: number): UseQueryReturnType<DashboardSpeciesByRiskDataResponse, unknown> =>
    useQuery(['fetch-species-by-risk', projectId, riskRatingId], async () => {
      if (projectId.value === undefined || riskRatingId === undefined) return { species: [] }
      const params: DashboardSpeciesByRiskParams = { projectId: projectId.value.toString() }
      return await apiBioGetDashboardSpeciesByRiskDataRoute(apiClient, params, { riskRatingId: riskRatingId.toString() }) ?? []
    })
