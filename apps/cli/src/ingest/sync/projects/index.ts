import { Sequelize } from 'sequelize'

import { getArbimonProjects, tranformArbimonToBioProjects } from '@/ingest/inputs/projects'
import { writeProjectsToPostgres } from '@/ingest/outputs/projects'

export const syncProjects = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  const arbimonProjects = await getArbimonProjects(arbimonSequelize)
  const projects = tranformArbimonToBioProjects(arbimonProjects)
  await writeProjectsToPostgres(biodiversitySequelize, projects)
}
