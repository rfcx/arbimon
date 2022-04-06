import { QueryTypes, Sequelize } from 'sequelize'

import { Site } from '@rfcx-bio/common/dao/types'

export interface ArbimonSite {
  'site_id': number
  'core_site_id': string | null
  'project_id': number
  'name': string
  'latitude': number
  'longitude': number
  'altitude': number
}

export const getArbimonSites = async (sequelize: Sequelize, siteIds: number[], projectId: number): Promise<Array<Omit<Site, 'id'>>> => {
  const sql =
    `
    SELECT s.site_id, s.project_id, s.external_id core_site_id, s.name, s.lat latitude, s.lon longitude, s.alt altitude
    FROM sites s
    WHERE s.site_id in (${siteIds.join(',')})
    `

  // Query Arbimon
  const results: ArbimonSite[] = await sequelize.query(sql, { type: QueryTypes.SELECT, raw: true })
  return results.map(i => {
    return {
      idCore: i.core_site_id ?? 'null',
      idArbimon: i.site_id,
      projectId,
      projectVersionFirstDetectionId: -1, // TODO: pass this data in
      name: i.name,
      latitude: i.latitude,
      longitude: i.longitude,
      altitude: i.altitude
    }
  })
}
