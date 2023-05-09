import { type Sequelize, QueryTypes } from 'sequelize'

export interface ExportedRecordingsByMonth {
  project_id: number
  site_id: number
  year: number
  month: number
  total_recordings: number
}

export const getRecordingsByMonth = async (sequelize: Sequelize): Promise<ExportedRecordingsByMonth[]> => {
  const sql = `
    select
      location_project_id as project_id,
      location_site_id as site_id,
      extract(year from time_precision_hour_local) as year,
      extract(month from time_precision_hour_local) as month,
      sum(count) as total_recordings
    from recording_by_site_hour
    group by 1, 2, 3, 4
    order by 1, 2, 3, 4
  `

  const recordings = await sequelize.query<ExportedRecordingsByMonth>(sql, { type: QueryTypes.SELECT, raw: true })
  return recordings
}
