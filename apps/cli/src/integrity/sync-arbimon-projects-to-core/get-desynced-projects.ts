import { QueryTypes, Sequelize } from 'sequelize'

export interface ArbimonProject {
  project_id: number
  name: string
  description: string
  is_private: 0 | 1
}

export const getDesyncedProjects = async (sequelize: Sequelize, limit: number): Promise<ArbimonProject[]> => {
  // Get desynced projects from Arbimon
  const sqlGetDesynced = `
    SELECT name, description, is_private, project_id
    FROM projects p
    WHERE p.external_id IS NULL
    ORDER BY project_id
    LIMIT ${limit}
    ;
  `
  return await sequelize.query(sqlGetDesynced, { type: QueryTypes.SELECT, raw: true })
}
