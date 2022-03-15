import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'

import { getArbimonProjects } from '@/data-ingest/projects/arbimon'
import { writeProjectsToPostgres } from '@/data-ingest/projects/db'
import { refreshMviews } from '../db/actions/refresh-mviews'
import { getSequelize } from '../db/connections'
import { syncDetectionsForProject } from './detections'
import { syncProjectSpeciesCall } from './species-call'

const main = async (): Promise<void> => {
  console.info('Daily sync start')
  try {
    const sequelize = getSequelize()

    console.info('STEP: Sync projects')
    const projects = await getArbimonProjects()
    await writeProjectsToPostgres(sequelize, projects)

    console.info('STEP: Get project lookups')
    const publishProjects = await LocationProjectModel(sequelize).findAll({
      where: { isPublished: true }
    })

    console.info('STEP: Sync site, species, and detections')
    for (const project of publishProjects) {
      console.info(`- site, species, detections: ${project.slug}`)
      await syncDetectionsForProject(sequelize, project)
    }

    console.info('STEP: Sync species calls')
    for (const project of publishProjects) {
      console.info(`- calls: ${project.slug}`)
      await syncProjectSpeciesCall(sequelize, project)
    }

    console.info('STEP: Refresh mviews')
    await refreshMviews(sequelize)

    console.info('Daily sync end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Daily sync end: failed')
  }
}

await main()
