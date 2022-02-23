import { getSequelize } from '@/db/connections'
import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'
import { syncDetectionsForProject } from './detections'

const main = async (): Promise<void> => {
  console.info('SYNCING: all project detections')
  try {
    const publishProjects = await LocationProjectModel(getSequelize()).findAll({
        where: { isPublished: true }
      })
    // ARB QUERY: sync detections + sites + species of each projects
    await Promise.all(publishProjects.map(async project => {
      await syncDetectionsForProject(project)
    }))
  } catch (error) {
    console.error(error)
  }

  process.exit(0)
}

await main()
