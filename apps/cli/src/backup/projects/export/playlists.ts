import { type Sequelize, QueryTypes } from 'sequelize'

export const getPlaylists = async (projectId: number, sequelize: Sequelize): Promise<Record<string, any>> => {
    const sql = ''
    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        replacements: {
            id: projectId
        },
        raw: true
    })
}

export const getPlaylistRecordings = async (projectId: number, sequelize: Sequelize): Promise<Record<string, any>> => {
    const sql = ''
    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        replacements: {
            id: projectId
        },
        raw: true
    })
}
