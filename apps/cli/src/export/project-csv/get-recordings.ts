import { type Sequelize, QueryTypes } from 'sequelize'

export interface ExportedRecording {
  recording_id: number
  site_id: number
  uri: string
}

export const getRecordings = async (projectId: number, sequelize: Sequelize): Promise<ExportedRecording[]> => {
  const sql = `
    select recording_id, site_id, uri
    from recordings
    where site_id in (select site_id from sites where project_id = $projectId)
    order by recording_id asc
  `
  const bind = { projectId }

  const sites = await sequelize.query<ExportedRecording>(sql, { bind, type: QueryTypes.SELECT, raw: true })
  return sites
}
