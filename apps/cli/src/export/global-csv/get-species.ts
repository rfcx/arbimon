import { type Sequelize, QueryTypes } from 'sequelize'

export interface ExportedSpecies {
  species_id: number
  scientific_name: string
  taxon_name: string
  iucn_status: string
  is_threatened: boolean
}

export const getSpecies = async (sequelize: Sequelize): Promise<ExportedSpecies[]> => {
  const sql = `
    select s.id as species_id, s.scientific_name, c.common_name taxon_name, rri.code iucn_code, rri.is_threatened
    from taxon_species s
    join taxon_class c on s.taxon_class_id = c.id
    left join taxon_species_iucn si on s.id = si.taxon_species_id
    left join risk_rating_iucn rri on si.risk_rating_iucn_id = rri.id
    order by species_id asc
  `

  const species = await sequelize.query<ExportedSpecies>(sql, { type: QueryTypes.SELECT, raw: true })
  return species
}
