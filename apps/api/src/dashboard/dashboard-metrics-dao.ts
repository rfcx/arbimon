import { type DashboardMetricsResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const getProjectMetrics = async (locationProjectId: number): Promise<DashboardMetricsResponse> => {
  const { LocationProjectMetric, LocationSite, DashboardSpeciesThreatened, TaxonSpeciesCall } = ModelRepository.getInstance(getSequelize())

  const [siteCount, metrics, speciesThreatenedCount, speciesCallsCount] = await Promise.all([
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
    }),
    TaxonSpeciesCall.count({
      where: { callProjectId: locationProjectId }
    })
  ])

  return {
    deploymentSites: siteCount,
    threatenedSpecies: speciesThreatenedCount,
    totalSpecies: metrics?.speciesCount == null ? 0 : Number(metrics.speciesCount),
    totalDetections: speciesCallsCount,
    totalRecordings: metrics?.detectionMinutesCount == null ? 0 : Number(metrics.detectionMinutesCount)
  }
}
