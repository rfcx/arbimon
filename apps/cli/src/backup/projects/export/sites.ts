import { type Sequelize, QueryTypes } from 'sequelize'

export const getSites = async (projectId: number, sequelize: Sequelize): Promise<object[]> => {
  const sql = `
    select site_id, name, lat latitude, lon longitude, alt elevation, timezone, country_code, hidden, created_at
    from sites
    where project_id = $projectId and deleted_at is null
    order by site_id asc
  `
  const bind = { projectId }

  const sites = await sequelize.query(sql, { bind, type: QueryTypes.SELECT, raw: true })
  return sites
}
