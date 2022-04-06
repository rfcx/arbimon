import { QueryTypes, Sequelize } from 'sequelize'

export interface ArbimonSite {
  'siteId': number
  'coreSiteId': string | null
  'projectId': number
  'name': string
  'latitude': number
  'longitude': number
  'altitude': number
}

export const getArbimonSitesByProjectId = async (sequelize: Sequelize, projectId: number): Promise<ArbimonSite[]> => {
  const sql =
    `
    SELECT  s.site_id AS siteId, 
            s.project_id AS projectId, 
            s.external_id AS core_site_id, 
            s.name, 
            s.lat AS latitude, 
            s.lon AS longitude, 
            s.alt AS altitude
    FROM sites s
    WHERE s.project_id in (${projectId})
    `

  // Query Arbimon
  const results: ArbimonSite[] = await sequelize.query(sql, { type: QueryTypes.SELECT, raw: true })
  return results
}
