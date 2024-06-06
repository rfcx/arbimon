import { type DashboardMetricsResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'

import { getSequelize } from '~/db'

export const getProjectMetrics = async (locationProjectId: number): Promise<DashboardMetricsResponse> => {
  const { LocationProjectMetric, DashboardSpeciesThreatened } = ModelRepository.getInstance(getSequelize())

  const [metrics, speciesThreatenedCount] = await Promise.all([
    LocationProjectMetric.findOne({
      attributes: {
        exclude: ['locationProjectId']
      },
      where: {
        locationProjectId
      },
      raw: true
    }),
    DashboardSpeciesThreatened.count({
      where: { locationProjectId }
    })
  ])

  return {
    totalSites: metrics?.siteCount == null ? 0 : Number(metrics.siteCount),
    threatenedSpecies: speciesThreatenedCount,
    totalSpecies: metrics?.speciesCount == null ? 0 : Number(metrics.speciesCount),
    totalDetections: metrics?.detectionMinutesCount == null ? 0 : Number(metrics.detectionMinutesCount),
    totalRecordings: metrics?.detectionMinutesCount == null ? 0 : Number(metrics.recordingMinutesCount),
    minDate: metrics?.minDate ?? null,
    maxDate: metrics?.maxDate ?? null
  }
}
