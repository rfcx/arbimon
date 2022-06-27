import { QueryTypes, Sequelize } from 'sequelize'

import { urlify } from '@rfcx-bio/utils/url-helpers'

import { SyncQueryParams } from './sync-query-params'

export interface ArbimonSpecies {
  'species_id': number
  'taxon_id': number
  'scientific_name': string
  'updated_at': string
}

export const getArbimonSpecies = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<Record<string, any>> => {
  const sql = `
    SELECT species_id, taxon_id, scientific_name, updated_at
    FROM species
    WHERE updated_at > $syncUntilDate OR (updated_at = $syncUntilDate AND species_id > $syncUntilId)
    ORDER BY updated_at, species_id
    LIMIT $syncBatchLimit;
  `

  const result: ArbimonSpecies[] = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      syncUntilDate: sequelize.getDialect() === 'mysql' ? syncUntilDate : syncUntilDate.toISOString(),
      syncUntilId,
      syncBatchLimit
    }
  })

  return result.map(sp => ({
    idArbimon: sp.species_id,
    slug: urlify(sp.scientific_name),
    scientificName: sp.scientific_name,
    taxonClassId: sp.taxon_id,
    updatedAt: sp.updated_at
  }))
}
