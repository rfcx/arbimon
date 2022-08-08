import { QueryTypes, Sequelize } from 'sequelize'

import { RichnessByExportReportRow } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { datasetFilterWhereRaw, FilterDatasetForSql } from '~/datasets/dataset-where'
import { RISK_RATING_PROTECTED_IDS } from '~/security/protected-species'

export const getRichnessExportData = async (sequelize: Sequelize, filter: FilterDatasetForSql, isProjectMember: boolean): Promise<RichnessByExportReportRow[]> => {
  const filterBase = datasetFilterWhereRaw(filter)

  const conditions = !isProjectMember ? `${filterBase.conditions} AND NOT sip.risk_rating_global_id = ANY ($protectedRiskRating) AND NOT sip.risk_rating_local_id = ANY ($protectedRiskRating)` : filterBase.conditions
  const bind = !isProjectMember ? { ...filterBase.bind, protectedRiskRating: RISK_RATING_PROTECTED_IDS } : filterBase.bind

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
