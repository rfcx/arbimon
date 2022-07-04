import { QueryTypes, Sequelize } from 'sequelize'

export const getArbimonProjectClasses = async (sequelize: Sequelize, projectId: number): Promise<unknown[]> => {
  const sql = `
    SELECT DISTINCT project_id as projectId, species_id as speciesId
    FROM project_classes
    WHERE project_id = $projectId;
  `

  return await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: { projectId }
  })
}
