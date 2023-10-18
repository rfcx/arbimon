import { type DashboardMetricsResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const getProjectMetrics = async (locationProjectId: number): Promise<DashboardMetricsResponse> => {
  const { LocationProjectMetric, LocationSite, DashboardSpeciesThreatened } = ModelRepository.getInstance(getSequelize())

  const [siteCount, metrics, speciesThreatenedCount] = await Promise.all([
    LocationSite.count({ where: { locationProjectId } }),
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
    deploymentSites: siteCount,
    threatenedSpecies: speciesThreatenedCount,
    totalSpecies: metrics?.speciesCount == null ? 0 : Number(metrics.speciesCount),
    totalDetections: metrics?.detectionMinutesCount == null ? 0 : Number(metrics.detectionMinutesCount),
    totalRecordings: metrics?.detectionMinutesCount == null ? 0 : Number(metrics.recordingMinutesCount),
    minDate: metrics?.minDate ?? null,
    maxDate: metrics?.maxDate ?? null
  }
}
