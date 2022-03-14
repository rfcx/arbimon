import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { refreshMviews } from '@/db/actions/refresh-mviews'
import { getSequelize } from '@/db/connections'
import { syncAllForProject } from '@/sync/sync-all'

const main = async (): Promise<void> => {
  console.info('Hourly sync start')
  try {
    const sequelize = getSequelize()

    console.info('STEP: Get all project lookups')
    const publishProjects = await ModelRepository.getInstance(sequelize).LocationProject.findAll({
      where: { isPublished: true }
    })

    console.info('STEP: Sync site, species, and detections')
    for (const project of publishProjects) {
      await syncAllForProject(sequelize, project)
    }

    console.info('STEP: Refresh mviews')
    await refreshMviews(sequelize)
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Hourly sync end: failed')
  }
}

await main()
