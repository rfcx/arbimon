import { type Sequelize, QueryTypes } from 'sequelize'

export const getSpecies = async (projectId: number, sequelize: Sequelize): Promise<Record<string, any>> => {
    // Can be customized to get the necessary data if requirements change
    const sql = `
        select *
        from species_in_project
        where location_project_id = $projectId
    `
    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        bind: { projectId },
        raw: true
    })
}