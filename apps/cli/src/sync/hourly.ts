import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { refreshMviews } from '../db/actions/refresh-mviews'
import { getSequelize } from '../db/connections'
import { syncDetectionsForProject } from './detections'

const main = async (): Promise<void> => {
  console.info('Hourly sync start')
  try {
    const sequelize = getSequelize()

    const projects = await ModelRepository.getInstance(sequelize)
      .LocationProject
      .findAll()

    // Arbimon: Detections + Sites + Species
    console.info('STEP: Sync site, species, and detections')
    for (const project of projects) {
      console.info(`- site, species, detections: ${project.slug}`)
      await syncDetectionsForProject(sequelize, project)
    }

    // - Data for new species:
    // - Arbimon: Species Calls
    // - IUCN: Common name + Risk
    // - IUCN: Description (currently coupled, but doesn't need to be)
    // - Wiki: Description + Photo
    // - In case we can't get the data from IUCN + WIKI to prevent the app from keep getting the data from the IUCN+Wiki every hour

    // console.info('STEP: Sync projects')
    // const projects = await getArbimonProjects()
    // await writeProjectsToPostgres(projects)

    // console.info('STEP: Get project lookups')
    // const publishProjects = await LocationProjectModel(sequelize).findAll({
    //   where: { isPublished: true }
    // })

    // console.info('STEP: Sync species calls')
    // for (const project of publishProjects) {
    //   console.info(`- calls: ${project.slug}`)
    //   await syncProjectSpeciesCall(sequelize, project)
    // }

    console.info('STEP: Refresh mviews')
    await refreshMviews(sequelize)

    console.info('Hourly sync end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Hourly sync end: failed')
  }
}

await main()
