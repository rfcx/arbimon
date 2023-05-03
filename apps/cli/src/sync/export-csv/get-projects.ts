import { type Sequelize, QueryTypes } from 'sequelize'

// todo: there might be some dao type that I can Pick<> off of.
export interface TempProject {
  id: string
  name: string
}

export const getProjects = async (sequelize: Sequelize): Promise<TempProject[]> => {
  // todo: I don't know whether the id is right or wrong
  const sql = `
    select id_arbimon as id, name
    from location_project
  `

  const projects = await sequelize.query<TempProject>(sql, { type: QueryTypes.SELECT, raw: true })
  return projects
}
