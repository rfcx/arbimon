import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { syncOnlyDetectionsForProject } from '@/sync/detections'

const main = async (): Promise<void> => {
  console.info('Hourly sync start')
  try {
    const sequelize = getSequelize()

    const projects = await ModelRepository.getInstance(sequelize)
    .LocationProject
    .findAll()

    for (const project of projects) {
      console.info(`- site, species, detections: ${project.slug}`)
      await syncOnlyDetectionsForProject(sequelize, project)
    }
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Hourly sync end: failed')
  }
}

await main()
