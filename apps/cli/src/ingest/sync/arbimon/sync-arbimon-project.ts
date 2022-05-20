import { Sequelize } from 'sequelize'

import { getArbimonProjects, tranformArbimonToBioProjects } from '@/ingest/inputs/arbimon-projects'
import { writeProjectsToBio } from '@/ingest/outputs/projects'

export const syncArbimonProjects = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncUntil: Date): Promise<void> => {
  const arbimonProjects = await getArbimonProjects(arbimonSequelize, syncUntil, 2)
  const projects = tranformArbimonToBioProjects(arbimonProjects)
  await writeProjectsToBio(biodiversitySequelize, projects)
}
