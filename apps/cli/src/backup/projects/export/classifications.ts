import { type Sequelize, QueryTypes } from 'sequelize'

export const getClassifications = async (projectId: number, sequelize: Sequelize, batch?: { limit?: number, offset?: number }): Promise<object[]> => {
    const { limit, offset } = batch ?? {}

    // Can be customized to get the necessary data if requirements change
    let sql = `
        select cr.* 
        from classification_results cr
        join job_params_classification jpc on cr.job_id = jpc.job_id 
        join models m on jpc.model_id = m.model_id 
        where m.model_type_id  = 4 and m.project_id = $projectId
      `
    const bind: { projectId: number, limit?: number, offset?: number } = { projectId }

    if (limit !== undefined) {
        sql += ' limit $limit'
        bind.limit = limit
    }

    if (offset !== undefined) {
        sql += ' offset $offset'
        bind.offset = offset
    }

    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        bind,
        raw: true
    })
}
