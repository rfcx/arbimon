import { type Sequelize, QueryTypes } from 'sequelize'

export interface ExportedProject {
  project_id: string
  name: string
}

export const getProjects = async (sequelize: Sequelize): Promise<ExportedProject[]> => {
  const sql = `
    select id as project_id, name
    from location_project
    order by project_id asc
  `

  const projects = await sequelize.query<ExportedProject>(sql, { type: QueryTypes.SELECT, raw: true })
  return projects
}
