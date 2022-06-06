import { AxiosInstance } from 'axios'

import { DashboardGeneratedResponse, dashboardGeneratedUrl } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { DashboardProfileResponse, dashboardProfileUrl } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

export const getDashboardGeneratedData = async (apiClient: AxiosInstance, projectId: number): Promise<DashboardGeneratedResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `${dashboardGeneratedUrl({ projectId: projectId.toString() })}`)

export const getDashboardProfileData = async (apiClient: AxiosInstance, projectId: number): Promise<DashboardProfileResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `${dashboardProfileUrl({ projectId: projectId.toString() })}`)
