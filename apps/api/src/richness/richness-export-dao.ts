import { type Sequelize, QueryTypes } from 'sequelize'

import { type RichnessByExportReportRow } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { type FilterDatasetForSql, datasetFilterWhereRaw } from '~/datasets/dataset-where'
import { RISK_RATING_PROTECTED_IDS } from '~/security/protected-species'

export const getRichnessExportData = async (sequelize: Sequelize, filter: FilterDatasetForSql, isProjectMember: boolean): Promise<RichnessByExportReportRow[]> => {
  const filterBase = datasetFilterWhereRaw(filter)

  const conditions = !isProjectMember ? `${filterBase.conditions} AND NOT sip.risk_rating_global_id = ANY ($protectedRiskRating) AND NOT sip.risk_rating_local_id = ANY ($protectedRiskRating)` : filterBase.conditions
  const bind = !isProjectMember ? { ...filterBase.bind, protectedRiskRating: RISK_RATING_PROTECTED_IDS } : filterBase.bind

  const sql = `
    SELECT
      ts.id_arbimon as species_id,
      ts.scientific_name as scientific_name,
      ls.id_arbimon as site_id,
      ls.name as site_name,
      ls.latitude as latitude,
      ls.longitude as longitude,
      ls.altitude as altitude,
      EXTRACT(day FROM dbssh.time_precision_hour_local) as day,
      EXTRACT(month FROM dbssh.time_precision_hour_local) as month,
      EXTRACT(year FROM dbssh.time_precision_hour_local) as year,
      EXTRACT(hour from dbssh.time_precision_hour_local) as hour,
      dbssh.count
    FROM
      detection_by_site_species_hour dbssh
      JOIN taxon_species ts ON dbssh.taxon_species_id = ts.id
      JOIN location_site ls ON dbssh.location_site_id = ls.id
    WHERE
      ${conditions}
    ORDER BY ts.scientific_name, dbssh.time_precision_hour_local
  `

  return await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true })
}
