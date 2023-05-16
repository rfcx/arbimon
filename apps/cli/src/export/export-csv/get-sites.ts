import { type Sequelize, QueryTypes } from 'sequelize'

export interface ExportedSite {
  project_id: string
  site_id: number
  name: string
  latitude: number
  longitude: number
  altitude: number
}

export const getSites = async (sequelize: Sequelize): Promise<ExportedSite[]> => {
  const sql = `
    select location_project_id as project_id, id as site_id, name, latitude, longitude, altitude
    from location_site
    order by project_id, site_id asc
  `

  const sites = await sequelize.query<ExportedSite>(sql, { type: QueryTypes.SELECT, raw: true })
  return sites
}
