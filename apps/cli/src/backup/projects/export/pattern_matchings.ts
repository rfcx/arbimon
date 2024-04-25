import { type Sequelize, QueryTypes } from 'sequelize'

export const getPatternMatchings = async (sequelize: Sequelize, projectId: number): Promise<Record<string, any>> => {
    const sql = ''

    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        replacements: {
            id: projectId
        },
        raw: true
    })
}

export const getPatternMatchingRois = async (sequelize: Sequelize, projectId: number): Promise<Record<string, any>> => {
    const sql = ''

    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        replacements: {
            id: projectId
        },
        raw: true
    })
}

export const getPatternMatchingValidations = async (sequelize: Sequelize, projectId: number): Promise<Record<string, any>> => {
    const sql = ''

    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        replacements: {
            id: projectId
        },
        raw: true
    })
}
