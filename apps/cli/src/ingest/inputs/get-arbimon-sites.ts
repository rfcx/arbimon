import { Sequelize } from 'sequelize'

import { getWithQueryParams } from './get-with-query-params'
import { SyncQueryParams } from './sync-query-params'

// TODO
export const getArbimonSites = async (sequelize: Sequelize, params: SyncQueryParams): Promise<unknown[]> => {
  return await getWithQueryParams(
    sequelize,
    params,
    `
    SELECT s.site_id AS idArbimon,
          s.external_id AS idCore,
          s.project_id AS projectIdArbimon,
          s.name,
          s.lat AS latitude,
          s.lon AS longitude,
          s.alt AS altitude,
          s.updated_at AS updatedAt
    FROM sites s
    WHERE s.updated_at > $syncUntilDate 
      OR (s.updated_at = $syncUntilDate AND s.site_id > $syncUntilId)
    ORDER BY s.updated_at, s.site_id
    LIMIT $syncBatchLimit
    ;
    `
  )
}
