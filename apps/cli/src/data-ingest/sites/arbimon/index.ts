import { Site } from '@rfcx-bio/common/dao/types'

import { mysqlSelect } from '../../../_services/mysql'
import { ARBIMON_CONFIG } from '../../_connections/arbimon'

export interface ArbimonSite {
  'site_id': number
  'core_site_id': string | null
  'project_id': number
  'name': string
  'latitude': number
  'longitude': number
  'altitude': number
}

export const getArbimonSites = async (siteIds: number[], locationProjectId: number): Promise<Array<Omit<Site, 'id'>>> => {
  const sql =
    `
    SELECT s.site_id, s.project_id, s.external_id core_site_id, s.name, s.lat latitude, s.lon longitude, s.alt altitude
    FROM sites s
    WHERE s.site_id in (${siteIds.join(',')})
    `

  // Query Arbimon
  const results = await mysqlSelect<ArbimonSite>(ARBIMON_CONFIG, sql)
  return results.map(i => {
    return {
      idCore: i.core_site_id ?? 'null',
      idArbimon: i.site_id,
      locationProjectId,
      name: i.name,
      latitude: i.latitude,
      longitude: i.longitude,
      altitude: i.altitude
    }
  })
}
