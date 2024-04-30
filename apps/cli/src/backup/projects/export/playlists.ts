import { type Sequelize, QueryTypes } from 'sequelize'

export const getPlaylists = async (projectId: number, sequelize: Sequelize): Promise<Record<string, any>> => {
    // Can be customized to get the necessary data if requirements change
    const sql = `
        select *
        from playlists
        where project_id = $projectId
        order by playlist_id asc
    `
    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        bind: { projectId },
        raw: true
    })
}

export const getPlaylistRecordings = async (projectId: number, sequelize: Sequelize): Promise<Record<string, any>> => {
    // Can be customized to get the necessary data if requirements change
    const sql = `
        select * 
        from playlist_recordings
        where playlist_id in (select playlist_id from playlists where project_id = $projectId)
    `
    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        bind: { projectId },
        raw: true
    })
}
