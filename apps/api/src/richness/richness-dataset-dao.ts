import { keyBy, mapValues } from 'lodash-es'
import { QueryTypes, Sequelize } from 'sequelize'

import { DetectedSpecies, RichnessSiteData } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'

import { datasetFilterWhereRaw, FilterDatasetForSql, whereInDataset } from '~/datasets/dataset-where'

export const getRichnessByTaxonClass = async (models: AllModels, sequelize: Sequelize, filter: FilterDatasetForSql): Promise<Record<number, number>> => {
  const result = await models
    .DetectionByVersionSiteSpeciesHour
    .findAll({
      attributes: ['taxonClassId', [sequelize.literal('COUNT(DISTINCT(taxon_species_id))::integer'), 'richness']],
      where: whereInDataset(filter),
      group: 'taxonClassId',
      raw: true
    }) as unknown as Array<{ taxonClassId: number, richness: number }>

  return Object.fromEntries(result.map(r => [r.taxonClassId, r.richness]))
}

export const getRichnessBySite = async (sequelize: Sequelize, filter: FilterDatasetForSql): Promise<RichnessSiteData[]> => {
  const { conditions, bind } = datasetFilterWhereRaw(filter)

  const sql = `
    SELECT
      species_group.project_site_id as "locationSiteId",
      species_group.taxon_class_id as "taxonClassId",
      COUNT(DISTINCT species_group.taxon_species_id)::integer as "richness"
    FROM (
      SELECT project_site_id, taxon_class_id, taxon_species_id
      FROM detection_by_version_site_species_hour dbvssh
      WHERE ${conditions}
      GROUP BY project_site_id, taxon_class_id, taxon_species_id
    ) species_group
    GROUP BY species_group.project_site_id, species_group.taxon_class_id
  `

  return await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as RichnessSiteData[]
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

  const monthExtraCondition = timeSeries === 'month' ? '- 1' : ''

  const sql = `
    SELECT gs.gs as grouped_time_bucket,
           COALESCE(data.richness, 0)::integer as richness
    FROM generate_series(0, ${seriesEnd(timeSeries)}) gs
    LEFT JOIN (
      SELECT extract(${timeSeries} FROM time_precision_hour_local) ${monthExtraCondition} as time_bucket,
             COUNT(distinct taxon_species_id) as richness
      FROM detection_by_version_site_species_hour dbvssh
      WHERE ${conditions}
      GROUP BY time_bucket
    ) as data
    ON gs.gs = data.time_bucket
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
             Count(distinct taxon_species_id)::integer as richness
      FROM detection_by_version_site_species_hour dbvssh
      WHERE ${conditions}
      GROUP BY DATE(time_precision_hour_local)
    ) as date_group
  `

  const result = await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true })
  return mapValues(keyBy(result, 'date_unix'), 'richness')
}

export const getDetectedSpecies = async (sequelize: Sequelize, filter: FilterDatasetForSql, isProjectMember: boolean): Promise<Record<number, DetectedSpecies>> => {
  // const filterBase = datasetFilterWhereRaw(filter)

  // const conditions = !isProjectMember ? `${filterBase.conditions} AND NOT sip.risk_rating_global_id = ANY ($protectedRiskRating)` : filterBase.conditions
  // const bind = !isProjectMember ? { ...filterBase.bind, protectedRiskRating: RISK_RATING_PROTECTED_IDS } : filterBase.bind

  // const sql = `
  //   SELECT
  //     ts.id as "taxon_species_id",
  //     ts.taxon_class_id as "taxon_class_id",
  //     ts.slug as "taxon_species_slug",
  //     ts.scientific_name as "scientific_name"
  //   FROM detection_by_version_site_species_hour dbvssh
  //   LEFT JOIN taxon_species ts on dbvssh.taxon_species_id = ts.id
  //   WHERE ${conditions}
  //   GROUP BY ts.id, ts.taxon_class_id, ts.slug, ts.scientific_name
  // `

  // await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true })

  // const sql = `
  //   SELECT
  //     sip.taxon_class_id as "taxonClassId",
  //     sip.taxon_species_id as "taxonSpeciesId",
  //     sip.taxon_species_slug as "taxonSpeciesSlug",
  //     sip.common_name as "commonName",
  //     sip.scientific_name as "scientificName"
  //   FROM detection_by_version_site_species_hour dbvssh
  //   LEFT JOIN species_in_project sip ON dbvssh.taxon_species_id = sip.taxon_species_id
  //   WHERE ${conditions}
  //   GROUP BY
  //     sip.taxon_species_id, sip.taxon_species_slug, sip.common_name, sip.scientific_name, sip.taxon_class_id, sip.risk_rating_global_id, dbvssh.taxon_species_id
  // `

  // return await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true })
  return {} // TODO: Update query (SIP no longer exists)
}
