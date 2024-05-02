import { type Sequelize, QueryTypes } from 'sequelize'

export const getRecordings = async (projectId: number, sequelize: Sequelize): Promise<object[]> => {
  const sql = `
    select recording_id, site_id, datetime, datetime_utc, sample_rate, duration, samples, file_size, bit_rate, sample_encoding, upload_time, meta, uri path
    from recordings
    where site_id in (select site_id from sites where project_id = $projectId)
    order by recording_id asc
  `
  const bind = { projectId }

  const sites = await sequelize.query(sql, { bind, type: QueryTypes.SELECT, raw: true })
  return sites
}
