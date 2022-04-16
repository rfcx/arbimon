import { QueryTypes, Sequelize } from 'sequelize'

import { ProjectSite } from '@rfcx-bio/common/dao/types'

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
            s.external_id AS coreSiteId, 
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

export const tranformArbimonToBioProjectSites = (arbimonSites: ArbimonSite[], projectId: number, projectVersionFirstAppearsId: number): Array<Omit<ProjectSite, 'id'>> => {
  return arbimonSites.map(s => ({
    idCore: s.coreSiteId ?? '',
    idArbimon: s.siteId,
    projectId,
    projectVersionFirstAppearsId,
    name: s.name,
    latitude: s.latitude,
    longitude: s.longitude,
    altitude: s.altitude
  }))
}
