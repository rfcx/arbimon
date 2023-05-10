import { type Sequelize, QueryTypes } from 'sequelize'

export interface ExportedProject {
  id: string
  name: string
}

export const getProjects = async (sequelize: Sequelize): Promise<ExportedProject[]> => {
  const sql = `
    select id, name
    from location_project
  `

  const projects = await sequelize.query<ExportedProject>(sql, { type: QueryTypes.SELECT, raw: true })
  return projects
}
