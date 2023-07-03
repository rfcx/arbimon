import { type DashboardMetricsResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const getProjectMetrics = async (locationProjectId: number): Promise<DashboardMetricsResponse> => {
  const { LocationProjectMetric, LocationSite } = ModelRepository.getInstance(getSequelize())

  const [siteCount, metric] = await Promise.all([
    LocationSite.count({ where: { locationProjectId } }),
    LocationProjectMetric.findOne({
      attributes: {
        exclude: ['locationProjectId']
      },
      where: {
        locationProjectId
      },
      raw: true
    })
  ])

  return {
    siteCount,
    speciesCount: metric?.speciesCount.toString() ?? '0',
    minDate: metric?.minDate ?? undefined,
    maxDate: metric?.maxDate ?? undefined,
    detectionMinutesCount: metric?.detectionMinutesCount ?? 0
  }
}
