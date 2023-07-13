import { keyBy, mapValues } from 'lodash-es'
import { type Sequelize, QueryTypes } from 'sequelize'

import { type RichnessPresence } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { type AllModels } from '@rfcx-bio/common/dao/model-repository'

import { type FilterDatasetForSql, datasetFilterWhereRaw, whereInDataset } from '~/datasets/dataset-where'
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
  let innerConditions = ''
  if (filter.siteIds.length > 0) {
    innerConditions += 'AND dbssh.location_site_id = ANY($siteIds) '
  }

  let conditions = !isProjectMember ? ' AND NOT sip.risk_rating_global_id = ANY ($protectedRiskRating) AND NOT sip.risk_rating_local_id = ANY ($protectedRiskRating)' : ''
  if (filter.taxons !== undefined && filter.taxons.length > 0) {
    conditions += 'AND sip.taxon_class_id = ANY($taxons) '
  }

  const bind = !isProjectMember ? { ...filter, protectedRiskRating: RISK_RATING_PROTECTED_IDS } : filter

  const sql = `
    select
      sip.taxon_class_id as "taxonClassId",
      sip.taxon_species_id as "taxonSpeciesId",
      sip.taxon_species_slug as "taxonSpeciesSlug",
      sip.common_name as "commonName",
      sip.scientific_name as "scientificName"
    from species_in_project sip
    where
      sip.location_project_id = $locationProjectId
      and exists (
        select 1
        from detection_by_site_species_hour dbssh
        where
          dbssh.location_project_id = sip.location_project_id
          and dbssh.taxon_species_id = sip.taxon_species_id
          and dbssh.time_precision_hour_local >= $startDateUtcInclusive
          and dbssh.time_precision_hour_local < $endDateUtcExclusive
          ${innerConditions}
      )
      ${conditions}
  `

  return await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    bind,
    raw: true
  })
}
