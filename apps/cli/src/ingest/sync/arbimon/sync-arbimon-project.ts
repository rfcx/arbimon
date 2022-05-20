import { Sequelize } from 'sequelize'

import { getArbimonProjects, tranformArbimonToBioProjects } from '@/ingest/inputs/get-arbimon-projects'
import { writeProjectsToBio } from '@/ingest/outputs/projects'

export const syncArbimonProjects = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncUntil: Date, lastSyncdId: number, batchLimit: number): Promise<void> => {
  const arbimonProjects = await getArbimonProjects(arbimonSequelize, syncUntil, lastSyncdId, batchLimit)
  const projects = tranformArbimonToBioProjects(arbimonProjects)
  await writeProjectsToBio(biodiversitySequelize, projects)
}
