import { QueryTypes, Sequelize } from 'sequelize'

import { TaxonSpecies } from '@rfcx-bio/common/dao/types'
import { urlify } from '@rfcx-bio/utils/url-helpers'

export type ArbimonSpeciesData = Pick<TaxonSpecies, 'idArbimon' | 'slug' | 'scientificName' | 'taxonClassId'>

export interface ArbimonSpecies {
  'species_id': number
  'taxon_id': number
  'scientific_name': string
}

export const getArbimonSpecies = async (sequelize: Sequelize, speciesIds: number[]): Promise<Array<Omit<ArbimonSpeciesData, 'taxon'>>> => {
  const sql =
    `
    SELECT s.species_id, s.taxon_id, s.scientific_name
    FROM species s
    WHERE s.species_id in (${speciesIds.join(',')})
    `

  // Query Arbimon
  const results: ArbimonSpecies[] = await sequelize.query(sql, { type: QueryTypes.SELECT, raw: true })

  return results.map(i => ({
    idArbimon: i.species_id,
    slug: urlify(i.scientific_name),
    scientificName: i.scientific_name,
    taxonClassId: i.taxon_id
  }))
}
