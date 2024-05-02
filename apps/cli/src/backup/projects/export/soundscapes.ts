import { type Sequelize, QueryTypes } from 'sequelize'

export const getSoundscapes = async (projectId: number, sequelize: Sequelize): Promise<object[]> => {
    // Can be customized to get the necessary data if requirements change
    const sql = `
        select *
        from soundscapes
        where project_id = $projectId
    `
    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        bind: { projectId },
        raw: true
    })
}
