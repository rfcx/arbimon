import { type Sequelize, QueryTypes } from 'sequelize'

export const getRecordings = async (projectId: number, sequelize: Sequelize, batch?: { limit?: number, offset?: number }): Promise<object[]> => {
  const { limit, offset } = batch ?? {}
  let sql = `
    select recording_id, site_id, datetime, datetime_utc, sample_rate, duration, samples, file_size, bit_rate, sample_encoding, upload_time, meta, uri path
    from recordings
    where site_id in (select site_id from sites where project_id = $projectId)
    order by recording_id asc
  `
  const bind: { projectId: number, limit?: number, offset?: number } = { projectId }

  if (limit !== undefined) {
    sql += ' limit $limit'
    bind.limit = limit
  }

  if (offset !== undefined) {
    sql += ' offset $offset'
    bind.offset = offset
  }

  return await sequelize.query(sql, { bind, type: QueryTypes.SELECT, raw: true })
}
