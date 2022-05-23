import { QueryTypes, Sequelize } from 'sequelize'

import { RichnessByExportReportRow } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { datasetFilterWhereRaw, FilterDatasetForSql } from '~/datasets/dataset-where'
import { RISK_RATING_PROTECTED_IDS } from '~/security/protected-species'

export const getRichnessExportData = async (sequelize: Sequelize, filter: FilterDatasetForSql, isProjectMember: boolean): Promise<RichnessByExportReportRow[]> => {
  const filterBase = datasetFilterWhereRaw(filter)

  const conditions = !isProjectMember ? `${filterBase.conditions} AND NOT sip.risk_rating_global_id = ANY ($protectedRiskRating)` : filterBase.conditions
  const bind = !isProjectMember ? { ...filterBase.bind, protectedRiskRating: RISK_RATING_PROTECTED_IDS } : filterBase.bind

  const sql = `
    SELECT
        tsm.scientific_name as scientificName,
        tsm.common_name as commonName,
        ps.name as site,
        ps.latitude as latitude,
        ps.longitude as longitude,
        ps.altitude as altitude,
        dbvssh.time_precision_hour_local as date,
        EXTRACT(day FROM dbvssh.time_precision_hour_local) as day,
        EXTRACT(month FROM dbvssh.time_precision_hour_local) as month,
        EXTRACT(year FROM dbvssh.time_precision_hour_local) as year,
        EXTRACT(hour from dbvssh.time_precision_hour_local) as hour
    FROM detection_by_version_site_species_hour dbvssh
    JOIN project_site ps on dbvssh.project_site_id = ps.id
    JOIN taxon_species_merged tsm on dbvssh.taxon_species_id = tsm.id
    WHERE ${conditions} 
    ORDER BY tsm.common_name, ps.name, dbvssh.time_precision_hour_local    
  `

  return await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true })
}
