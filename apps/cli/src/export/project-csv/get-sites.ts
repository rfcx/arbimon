import { type Sequelize, QueryTypes } from 'sequelize'

export interface ExportedSite {
  site_id: number
  name: string
  latitude: number
  longitude: number
  altitude: number
}

export const getSites = async (projectId: number, sequelize: Sequelize): Promise<ExportedSite[]> => {
  const sql = `
    select site_id, name, lat, lon, alt
    from sites
    where project_id = $projectId
    order by site_id asc
  `
  const bind = { projectId }

  const sites = await sequelize.query<ExportedSite>(sql, { bind, type: QueryTypes.SELECT, raw: true })
  return sites
}
