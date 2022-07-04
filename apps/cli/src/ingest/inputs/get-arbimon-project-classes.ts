import { QueryTypes, Sequelize } from 'sequelize'

export const getArbimonProjectClasses = async (sequelize: Sequelize, projectId: number): Promise<unknown[]> => {
  const sql = `
    SELECT DISTINCT project_id as locationProjectId, species_id as taxonSpeciesId
    FROM project_classes
    WHERE project_id = $projectId;
  `

  return await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: { projectId }
  })
}
