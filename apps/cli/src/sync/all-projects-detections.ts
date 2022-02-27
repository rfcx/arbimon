import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'

import { getSequelize } from '../db/connections'
import { syncDetectionsForProject } from './detections'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  console.info('SYNCING: all project detections')
  try {
    const publishProjects = await LocationProjectModel(sequelize).findAll({
        where: { isPublished: true }
      })
    // ARB QUERY: sync detections + sites + species of each projects
    await Promise.all(publishProjects.map(async project => {
      await syncDetectionsForProject(sequelize, project)
    }))
  } catch (error) {
    console.error(error)
  }

  process.exit(0)
}

await main()
