import { Sequelize, Transaction } from 'sequelize'

export const createProjectVersionIfNeeded = async (sequelize: Sequelize, transaction: Transaction | null = null): Promise<void> => {
  const sql = `
    INSERT INTO project_version (project_id, created_at, updated_at)
      SELECT p.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM project p
      LEFT JOIN project_version pv ON pv.project_id = p.id
      WHERE pv.project_id IS NULL
    ;
  `
  await sequelize.query(sql, {
    ...transaction && { transaction }
  })
}
