import { type Sequelize, QueryTypes } from 'sequelize'

export const getPatternMatchings = async (projectId: number, sequelize: Sequelize): Promise<object[]> => {
    // Can be customized to get the necessary data if requirements change
    const sql = `
        select *
        from pattern_matchings
        where project_id = $projectId
    `

    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        bind: { projectId },
        raw: true
    })
}

export const getPatternMatchingRois = async (projectId: number, sequelize: Sequelize): Promise<object[]> => {
    // Can be customized to get the necessary data if requirements change
    const sql = `
        select pattern_matching_roi_id, pattern_matching_id, recording_id, species_id, songtype_id, 
            x1, y1, x2, y2, score, validated,
            uri path
        from pattern_matching_rois
        where pattern_matching_id in (select pattern_matching_id from pattern_matchings where project_id = $projectId)
    `

    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        bind: { projectId },
        raw: true
    })
}

export const getPatternMatchingValidations = async (projectId: number, sequelize: Sequelize): Promise<object[]> => {
    // Can be customized to get the necessary data if requirements change
    const sql = `
        select *
        from pattern_matching_validations
        where pattern_matching_roi_id in 
            (select pattern_matching_roi_id from pattern_matching_rois where pattern_matching_id in 
                (select pattern_matching_id from pattern_matchings where project_id = $projectId ))
    `

    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        bind: { projectId },
        raw: true
    })
}
