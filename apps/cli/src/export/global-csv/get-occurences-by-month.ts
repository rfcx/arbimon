import { type Sequelize, QueryTypes } from 'sequelize'

export interface ExportedOccurencesByMonth {
  project_id: number
  site_id: number
  species_id: string
  year: number
  month: number
  total_occurences: number
}

export const getOccurencesByMonth = async (sequelize: Sequelize): Promise<ExportedOccurencesByMonth[]> => {
  const sql = `
    select
      location_project_id as project_id,
      location_site_id as site_id,
      taxon_species_id as species_id,
      extract(year from time_precision_hour_local) "year",
      extract(month from time_precision_hour_local) "month",
      sum(count) as total_occurences
    from detection_by_site_species_hour
    group by 1, 2, 3, 4, 5
    order by 1, 2, 3, 4, 5
  `

  const occurences = await sequelize.query<ExportedOccurencesByMonth>(sql, { type: QueryTypes.SELECT, raw: true })
  return occurences
}
