import { QueryTypes, Sequelize } from 'sequelize'

export const addProjectCoreIdInArbimon = async (sequelize: Sequelize, idArbimon: number, idCore: string): Promise<void> => {
  const sql = `
    UPDATE projects
    SET external_id = $idCore
    WHERE project_id = $idArbimon
    ;
  `

  const bind = { idArbimon, idCore }
  await sequelize.query(sql, { bind, type: QueryTypes.UPDATE, raw: true })
}
