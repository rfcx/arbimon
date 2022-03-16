import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'
import { wait } from '@rfcx-bio/utils/async'

import { getSequelize } from '@/db/connections'
import { syncProjectSpeciesCall } from './species-call'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  console.info('SYNCING: all project detections')
  try {
    const publishProjects = await LocationProjectModel(sequelize).findAll({
        where: { isPublished: true }
      })
    // ARB QUERY: sync detections + sites + species of each projects
    for (const project of publishProjects) {
      await Promise.all([syncProjectSpeciesCall(sequelize, project), wait(500)])
    }
  } catch (error) {
    console.error(error)
  }

  process.exit(0)
}

await main()
