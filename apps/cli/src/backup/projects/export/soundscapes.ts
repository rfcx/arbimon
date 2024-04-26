import { type Sequelize, QueryTypes } from 'sequelize'

export const getSoundscapes = async (projectId: number, sequelize: Sequelize): Promise<Record<string, any>> => {
    // Can be customized to get the necessary data if requirements change
    const sql = `
        select *
        from soundscapes
        where project_id = :id
    `
    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        replacements: {
            id: projectId
        },
        raw: true
    })
}
