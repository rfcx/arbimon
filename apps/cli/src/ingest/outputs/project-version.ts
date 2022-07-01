import { Sequelize, Transaction } from 'sequelize'

export const createProjectVersionIfNeeded = async (sequelize: Sequelize, transaction: Transaction | null = null): Promise<void> => {
  const sql = `
    INSERT INTO project_version (location_project_id, created_at, updated_at)
      SELECT p.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM location_project p
      LEFT JOIN project_version pv ON pv.location_project_id = p.id
      WHERE pv.location_project_id IS NULL
    ;
  `
  await sequelize.query(sql, {
    ...transaction && { transaction }
  })
}
