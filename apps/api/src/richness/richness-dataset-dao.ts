import { keyBy, mapValues } from 'lodash-es'
import { QueryTypes, Sequelize } from 'sequelize'

import { RichnessByExportReportRow, RichnessPresence } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'

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
    SELECT gs.gs as grouped_time_bucket, COALESCE(data.richness, 0) as richness
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

export const getRichnessPresence = async (sequelize: Sequelize, filter: FilterDatasetForSql, hasProjectPermission: boolean): Promise<Record<number, RichnessPresence>> => {
  const filterBase = datasetFilterWhereRaw(filter)

  const conditions = !hasProjectPermission ? `${filterBase.conditions} AND NOT sip.risk_rating_global_id = ANY ($protectedRiskRating)` : filterBase.conditions
  const bind = !hasProjectPermission ? { ...filterBase.bind, protectedRiskRating: RISK_RATING_PROTECTED_IDS } : filterBase.bind

  const sql = `
    SELECT 
      sip.taxon_class_id as "taxonClassId",
      sip.taxon_species_id as "taxonSpeciesId",
      sip.taxon_species_slug as "taxonSpeciesSlug",
      sip.common_name as "commonName",
      sip.scientific_name as "scientificName"
    FROM
      detection_by_site_species_hour dbssh
      LEFT JOIN species_in_project sip ON dbssh.taxon_species_id = sip.taxon_species_id
    WHERE ${conditions}
    GROUP BY
      sip.taxon_species_id, sip.taxon_species_slug, sip.common_name, sip.scientific_name, sip.taxon_class_id, sip.risk_rating_global_id, dbssh.taxon_species_id
  `

  return await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true })
}

export const getRichnessExport = async (sequelize: Sequelize, filter: FilterDatasetForSql, hasProjectPermission: boolean): Promise<RichnessByExportReportRow[]> => {
  const filterBase = datasetFilterWhereRaw(filter)

  const conditions = !hasProjectPermission ? `${filterBase.conditions} AND NOT sip.risk_rating_global_id = ANY ($protectedRiskRating)` : filterBase.conditions
  const bind = !hasProjectPermission ? { ...filterBase.bind, protectedRiskRating: RISK_RATING_PROTECTED_IDS } : filterBase.bind

  const sql = `
    SELECT 
      sip.common_name as name,
      ls.name as site,
      ls.latitude as latitude,
      ls.longitude as longitude,
      ls.altitude as altitude,
      EXTRACT(day FROM dbssh.time_precision_hour_local) as day,
      EXTRACT(month FROM dbssh.time_precision_hour_local) as month,
      EXTRACT(year FROM dbssh.time_precision_hour_local) as year,
      dbssh.time_precision_hour_local as date,
      EXTRACT(hour from dbssh.time_precision_hour_local) as hour
    FROM
      detection_by_site_species_hour dbssh
      LEFT JOIN species_in_project sip ON dbssh.taxon_species_id = sip.taxon_species_id
      LEFT JOIN location_site ls ON dbssh.location_site_id = ls.id
    WHERE ${conditions} 
    GROUP BY
      ls.id, sip.taxon_species_slug, sip.common_name, sip.scientific_name, sip.taxon_class_id, dbssh.taxon_species_id, dbssh.time_precision_hour_local
    ORDER BY sip.common_name, ls.name, dbssh.time_precision_hour_local
  `

  return await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true })
}
