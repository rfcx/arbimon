import { type Sequelize, QueryTypes } from 'sequelize'

export const getTemplates = async (projectId: number, sequelize: Sequelize): Promise<object[]> => {
    // Can be customized to get the necessary data if requirements change
    const sql = `
        select
            t.template_id, t.recording_id, t.species_id, t.songtype_id, 
            t.name, t.x1, t.y1, t.x2, t.y2, t.date_created, p.name source_project_name,
            t.uri path
        from templates t left join projects p on t.source_project_id = p.project_id
        where t.project_id = $projectId
    `

    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        bind: { projectId },
        raw: true
    })
}
