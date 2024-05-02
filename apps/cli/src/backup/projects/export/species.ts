import { type Sequelize, QueryTypes } from 'sequelize'

export const getSpecies = async (projectId: number, sequelize: Sequelize): Promise<object[]> => {
    // Can be customized to get the necessary data if requirements change
    const sql = `
        select s.species_id, s.scientific_name, sf.family, t.taxon, st.songtype_id, st.songtype 
        from project_classes pc 
            join species s on s.species_id = pc.species_id 
            join songtypes st on pc.songtype_id = st.songtype_id 
            join species_families sf on s.family_id = sf.family_id 
            join species_taxons t on s.taxon_id = t.taxon_id 
        where project_id = $projectId
    `

    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        bind: { projectId },
        raw: true
    })
}
