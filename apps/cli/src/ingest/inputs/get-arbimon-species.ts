import { type Sequelize, QueryTypes } from 'sequelize'

import { type SyncQueryParams } from './sync-query-params'

export const getArbimonSpecies = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<Array<Record<string, any>>> => {
  const sql = `
    SELECT species_id as idArbimon, taxon_id as taxonClassId, scientific_name as scientificName, updated_at as updatedAt
    FROM species
    WHERE updated_at > $syncUntilDate OR (updated_at = $syncUntilDate AND species_id > $syncUntilId)
    ORDER BY updated_at, species_id
    LIMIT $syncBatchLimit;
  `

  return await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      syncUntilDate: sequelize.getDialect() === 'mysql' ? syncUntilDate : syncUntilDate.toISOString(),
      syncUntilId,
      syncBatchLimit: String(syncBatchLimit)
    }
  })
}
