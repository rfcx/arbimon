import { partition } from 'lodash-es'
import { Sequelize } from 'sequelize'

import { getArbimonProjects } from '@/ingest/inputs/get-arbimon-projects'
import { writeProjectsToBio } from '@/ingest/outputs/projects'
import { parseProjectArbimonToBio } from '../parsers/parse-project-arbimon-to-bio'

export const syncArbimonProjects = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncUntil: Date, lastSyncdId: number, batchLimit: number): Promise<void> => {
  const arbimonProjects = await getArbimonProjects(arbimonSequelize, syncUntil, lastSyncdId, batchLimit)

  const [projects, errors] = partition(arbimonProjects.map(parseProjectArbimonToBio), p => p.success)

  await writeProjectsToBio(biodiversitySequelize, projects)
  // await writeErrorsToBio(projectsInvalid)
  console.log(errors)
}
