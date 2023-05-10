import { type Sequelize, QueryTypes } from 'sequelize'

export interface ExportedSite {
  id: number
  name: string
  lat: number
  lng: number
  project_id: string
}

export const getSites = async (sequelize: Sequelize): Promise<ExportedSite[]> => {
  const sql = `
    select id, name, latitude as lat, longitude as lng, location_project_id as project_id
    from location_site
  `

  const sites = await sequelize.query<ExportedSite>(sql, { type: QueryTypes.SELECT, raw: true })
  return sites
}
