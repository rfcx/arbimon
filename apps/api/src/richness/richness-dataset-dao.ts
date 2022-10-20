import { keyBy, mapValues } from 'lodash-es'
import { Op, QueryTypes, Sequelize } from 'sequelize'

import { RichnessPresence } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { AllModels, ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { datasetFilterWhereRaw, FilterDatasetForSql, whereInDataset } from '~/datasets/dataset-where'
import { RISK_RATING_PROTECTED_IDS } from '~/security/protected-species'

export const getRichnessByTaxonClass = async (models: AllModels, sequelize: Sequelize, filter: FilterDatasetForSql): Promise<Record<number, number>> => {
  const result = await models
    .DetectionBySiteSpeciesHour
    .findAll({
      attributes: ['taxonClassId', [sequelize.literal('COUNT(DISTINCT(taxon_species_id))::integer'), 'richness']],
      where: whereInDataset(filter),
      group: 'taxonClassId',
      raw: true
    }) as unknown as Array<{ taxonClassId: number, richness: number }>

  return Object.fromEntries(result.map(r => [r.taxonClassId, r.richness]))
}

// TODO 640: Move with `getRichnessBySite()`
export interface SpeciesCountBySite {
  locationSiteId: number
  taxonClassId: number
  richness: number
}

export const getRichnessBySite = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<SpeciesCountBySite[]> => {
  const { conditions, bind } = datasetFilterWhereRaw(filter)

  const sql = `
    SELECT 
      species_group.location_site_id as "locationSiteId",
      species_group.taxon_class_id as "taxonClassId",
      COUNT(DISTINCT species_group.taxon_species_id)::integer as "richness"
    FROM (
      SELECT location_site_id, taxon_class_id, taxon_species_id
      FROM detection_by_site_species_hour dbssh
      WHERE ${conditions}
      GROUP BY location_site_id, taxon_class_id, taxon_species_id
    ) species_group
    GROUP BY species_group.location_site_id, species_group.taxon_class_id
  `

  return await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as SpeciesCountBySite[]
}

type TimeSeries = 'hour' | 'dow' | 'month'

export const getRichnessByTimeSeries = async (sequelize: Sequelize, filter: FilterDatasetForSql, timeSeries: TimeSeries): Promise<Record<number, number>> => {
  const { conditions, bind } = datasetFilterWhereRaw(filter)

  const seriesEnd = (t: TimeSeries): number => {
    switch (t) {
      case 'dow': return 6
      case 'month': return 11
      default: return 23
    }
  }

  const sql = `
    SELECT gs.gs as grouped_time_bucket, COALESCE(data.richness, 0)::integer as richness
    FROM generate_series(0, ${seriesEnd(timeSeries)}) gs
      LEFT JOIN (
      SELECT extract(${timeSeries} FROM time_precision_hour_local) as grouped_time_bucket,
             Count(distinct taxon_species_id) as richness
      FROM detection_by_site_species_hour dbssh
      WHERE ${conditions}
      GROUP BY grouped_time_bucket
    ) as data
    ON gs.gs = data.grouped_time_bucket
    ORDER BY gs.gs
  `

  const result = await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true })
  return mapValues(keyBy(result, 'grouped_time_bucket'), 'richness')
}

export const getRichnessByTimeHourOfDay = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<Record<number, number>> => {
  return await getRichnessByTimeSeries(sequelize, filter, 'hour')
}

export const getRichnessByTimeDayOfWeek = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<Record<number, number>> => {
  return await getRichnessByTimeSeries(sequelize, filter, 'dow')
}

export const getRichnessByTimeMonthOfYear = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<Record<number, number>> => {
  return await getRichnessByTimeSeries(sequelize, filter, 'month')
}

export const getRichnessByTimeUnix = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<Record<number, number>> => {
  const { conditions, bind } = datasetFilterWhereRaw(filter)

  const sql = `
    SELECT extract(epoch FROM date_group.date) as date_unix, date_group.richness
    FROM (
      SELECT DATE(time_precision_hour_local) as date,
             Count(distinct taxon_species_id) as richness
      FROM detection_by_site_species_hour dbssh
      WHERE ${conditions}
      GROUP BY DATE(time_precision_hour_local)
    ) as date_group
  `

  const result = await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true })
  return mapValues(keyBy(result, 'date_unix'), 'richness')
}

export const getRichnessPresence = async (sequelize: Sequelize, filter: FilterDatasetForSql, isProjectMember: boolean): Promise<RichnessPresence[]> => {
  const { locationProjectId, startDateUtcInclusive, endDateUtcExclusive, taxons } = filter // ignore siteIds
  const commonWhere = {
    locationProjectId,
    detectionMinHourLocal: startDateUtcInclusive,
    detectionMaxHourLocal: endDateUtcExclusive,
    taxonClassId: taxons
  }
  const nonProjectMemberWhere = {
    riskRatingGlobalId: { [Op.notIn]: RISK_RATING_PROTECTED_IDS },
    riskRatingLocalId: { [Op.notIn]: RISK_RATING_PROTECTED_IDS }
  }
  const where = isProjectMember ? commonWhere : { ...commonWhere, ...nonProjectMemberWhere }
  const attributes = ['taxonClassId', 'taxonSpeciesId', 'taxonSpeciesSlug', 'commonName', 'scientificName']
  const { SpeciesInProject } = ModelRepository.getInstance(sequelize)
  return await SpeciesInProject.findAll({ where, attributes, raw: true })
}
