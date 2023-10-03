import { type DashboardMetricsResponse, type DashboardMinMaxDatesResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const getProjectMetrics = async (locationProjectId: number): Promise<DashboardMetricsResponse> => {
  const { LocationProjectMetric, LocationSite, DashboardSpeciesThreatened, TaxonSpeciesCall, RecordingBySiteHour } = ModelRepository.getInstance(getSequelize())

  const [siteCount, metrics, speciesThreatenedCount, speciesCallsCount, minDate, maxDate] = await Promise.all([
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
    }),
    RecordingBySiteHour.min('timePrecisionHourLocal', {
      where: { locationProjectId },
      raw: true
    }),
    RecordingBySiteHour.max('timePrecisionHourLocal', {
      where: { locationProjectId },
      raw: true
    })
  ])

  return {
    deploymentSites: siteCount,
    threatenedSpecies: speciesThreatenedCount,
    totalSpecies: metrics?.speciesCount == null ? 0 : Number(metrics.speciesCount),
    totalDetections: speciesCallsCount,
    totalRecordings: metrics?.detectionMinutesCount == null ? 0 : Number(metrics.detectionMinutesCount),
    minDate: minDate as Date | null,
    maxDate: maxDate as Date | null
  }
}

export const getProjectMinMaxDates = async (locationProjectId: number): Promise<DashboardMinMaxDatesResponse> => {
  const { RecordingBySiteHour } = ModelRepository.getInstance(getSequelize())

  const [minDate, maxDate] = await Promise.all([
    RecordingBySiteHour.min('timePrecisionHourLocal', {
      where: { locationProjectId },
      raw: true
    }),
    RecordingBySiteHour.max('timePrecisionHourLocal', {
      where: { locationProjectId },
      raw: true
    })
  ])

  return {
    minDate: minDate as Date | null,
    maxDate: maxDate as Date | null
  }
}
