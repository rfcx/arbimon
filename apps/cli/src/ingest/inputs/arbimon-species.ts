import { QueryTypes, Sequelize } from 'sequelize'

export interface ArbimonSpecies {
  idArbimon: number
  slug: string
  scientificName: string
  taxonSlug: string
}

export const getArbimonSpeciesIncremental = async (sequelize: Sequelize): Promise<ArbimonSpecies[]> => {
  const sql = `
    SELECT s.species_id AS idArbimon,
         replace(lower(s.scientific_name), ' ', '-') AS slug,
         s.scientific_name AS scientificName,
         lower(t.taxon) AS taxonSlug
    FROM species s
    JOIN species_taxons t on s.taxon_id = t.taxon_id
    WHERE t.enabled = 1
    -- AND s.updated_at > ???
    -- ORDER BY s.updated_at ASC
    -- LIMIT 1000
    LIMIT 5
    ;
  `

  return await sequelize.query<ArbimonSpecies>(sql, { type: QueryTypes.SELECT, raw: true })
}
