import { QueryTypes } from 'sequelize'

import { type DashboardMetricsResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type DetectionBySiteSpeciesHour } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'

export const getProjectMetrics = async (locationProjectId: number): Promise<DashboardMetricsResponse> => {
  const { LocationProjectMetric, DashboardSpeciesThreatened } = ModelRepository.getInstance(getSequelize())
  const sequelize = getSequelize()
  const availableSpeciesSql = `
    select dbsh.taxon_species_id as "taxonSpeciesId"
    from detection_by_site_species_hour dbsh
    join location_site ls ON dbsh.location_site_id = ls.id
    where dbsh.location_project_id = ${locationProjectId} AND ls.hidden is false;
  `
  const availableSpeciesRes = await sequelize.query<DetectionBySiteSpeciesHour>(availableSpeciesSql, { type: QueryTypes.SELECT })

  const [metrics, speciesThreatened] = await Promise.all([
    LocationProjectMetric.findOne({
      attributes: {
        exclude: ['locationProjectId']
      },
      where: {
        locationProjectId
      },
      raw: true
    }),
    DashboardSpeciesThreatened.findAll({
      where: { locationProjectId },
      attributes: ['taxonSpeciesId'],
      raw: true
    })
  ])

  const availableSpecies = availableSpeciesRes.map(s => s.taxonSpeciesId) as unknown as number[]
  const availableSpeciesThreatened = speciesThreatened.filter(sp => availableSpecies.includes(sp.taxonSpeciesId)) ?? []

  return {
    totalSites: metrics?.siteCount == null ? 0 : Number(metrics.siteCount),
    threatenedSpecies: availableSpeciesThreatened.length,
    totalSpecies: metrics?.speciesCount == null ? 0 : Number(metrics.speciesCount),
    totalDetections: metrics?.detectionMinutesCount == null ? 0 : Number(metrics.detectionMinutesCount),
    totalRecordings: metrics?.detectionMinutesCount == null ? 0 : Number(metrics.recordingMinutesCount),
    minDate: metrics?.minDate ?? null,
    maxDate: metrics?.maxDate ?? null
  }
}
