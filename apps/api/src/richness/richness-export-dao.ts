import { QueryTypes, Sequelize } from 'sequelize'

import { RichnessByExportReportRow } from '@rfcx-bio/common/api-bio/richness/richness-export'
import { RISK_RATING_PROTECTED_IDS } from '@rfcx-bio/common/dao/master-data'

import { datasetFilterWhereRaw, FilterDatasetForSql } from '~/datasets/dataset-where'

// TODO: Replace this with a generic implementation of `SnakeCase<RichnessByExportReportRow>` in TS 4.5
type RichnessByExportReportRowSql = Omit<RichnessByExportReportRow, 'scientificName' | 'commonName' | 'countDetectionMinutes'> & {
  scientific_name: string
  common_name?: string
  count_detection_minutes: number
}

export const getRichnessExportData = async (sequelize: Sequelize, filter: FilterDatasetForSql, isProjectMember: boolean): Promise<RichnessByExportReportRow[]> => {
  const filterBase = datasetFilterWhereRaw(filter)

  const conditions = !isProjectMember ? `${filterBase.conditions} AND NOT tsp.risk_rating_id = ANY ($protectedRiskRating)` : filterBase.conditions
  const bind = !isProjectMember ? { ...filterBase.bind, protectedRiskRating: RISK_RATING_PROTECTED_IDS } : filterBase.bind

  const sql = `
    SELECT
        tsm.scientific_name,
        tsm.common_name,
        ps.name as site,
        ps.latitude as latitude,
        ps.longitude as longitude,
        ps.altitude as altitude,
        dbvssh.time_precision_hour_local as date,
        EXTRACT(year FROM dbvssh.time_precision_hour_local) as year,
        EXTRACT(month FROM dbvssh.time_precision_hour_local) as month,
        EXTRACT(day FROM dbvssh.time_precision_hour_local) as day,
        EXTRACT(hour from dbvssh.time_precision_hour_local) as hour,
        dbvssh.count_detection_minutes
    FROM detection_by_version_site_species_hour dbvssh
    ${!isProjectMember ? 'JOIN taxon_species_project_risk_rating as tsp on dbvssh.taxon_species_id = tsp.taxon_species_id' : ''}
    JOIN project_site ps on dbvssh.project_site_id = ps.id
    JOIN taxon_species_merged tsm on dbvssh.taxon_species_id = tsm.id
    WHERE ${conditions}
    ORDER BY tsm.common_name, ps.name, dbvssh.time_precision_hour_local
  `

  return await sequelize.query<RichnessByExportReportRowSql>(sql, { type: QueryTypes.SELECT, bind, raw: true })
    .then(res => res.map(({ scientific_name: scientificName, common_name: commonName, count_detection_minutes: countDetectionMinutes, ...rest }) =>
      ({ scientificName, commonName, countDetectionMinutes, ...rest })
    ))
}
