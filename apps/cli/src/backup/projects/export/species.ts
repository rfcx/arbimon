import { type Sequelize, QueryTypes } from 'sequelize'

export const getSpecies = async (sequelize: Sequelize, projectId: number): Promise<Record<string, any>> => {
    const sql = `
        select
            *
        from species_in_project
        where location_project_id = :id
    `
    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        replacements: {
            id: projectId
        },
        raw: true
    })
}
