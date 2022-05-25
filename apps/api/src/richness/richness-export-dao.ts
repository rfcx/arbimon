import { QueryTypes, Sequelize } from 'sequelize'

import { RichnessByExportReportRow } from '@rfcx-bio/common/api-bio/richness/richness-export'
import { RISK_RATING_PROTECTED_ID } from '@rfcx-bio/common/dao/master-data'

import { datasetFilterWhereRaw, FilterDatasetForSql } from '~/datasets/dataset-where'

// TODO: Replace this with a generic implementation of `SnakeCase<RichnessByExportReportRow>` in TS 4.5
type RichnessByExportReportRowSql = Omit<RichnessByExportReportRow, 'scientificName' | 'commonName' | 'countDetectionMinutes'> & {
  scientific_name: string
  common_name?: string
  count_detection_minutes: number
}

export const getRichnessExportData = async (sequelize: Sequelize, filter: FilterDatasetForSql, isProjectMember: boolean): Promise<RichnessByExportReportRow[]> => {
  const conditionsAndBindBase = datasetFilterWhereRaw(filter)

  // Remove protected species if not a project member
  const { conditions, bind } = isProjectMember
    ? conditionsAndBindBase
    : {
      conditions: `${conditionsAndBindBase.conditions} AND tsm.risk_rating_id != $riskRatingProtectedId AND tsp.risk_rating_id != $riskRatingProtectedId`,
      bind: { ...conditionsAndBindBase.bind, riskRatingProtectedId: RISK_RATING_PROTECTED_ID }
    }

  const nonProjectMemberJoins = `
    LEFT JOIN taxon_species_project_risk_rating as tsp on tsp.taxon_species_id = dbvssh.taxon_species_id AND tsp.project_id = dbvssh.project_id
  `

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
        JOIN project_site ps on dbvssh.project_site_id = ps.id
        JOIN taxon_species_merged tsm on dbvssh.taxon_species_id = tsm.id
        ${!isProjectMember ? nonProjectMemberJoins : ''}
    WHERE ${conditions}
    ORDER BY tsm.common_name, ps.name, dbvssh.time_precision_hour_local
  `

  return await sequelize.query<RichnessByExportReportRowSql>(sql, { type: QueryTypes.SELECT, bind, raw: true })
    .then(res => res.map(({ scientific_name: scientificName, common_name: commonName, count_detection_minutes: countDetectionMinutes, ...rest }) =>
      ({ scientificName, commonName, countDetectionMinutes, ...rest })
    ))
}
