import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { wait } from '@rfcx-bio/utils/async'

import { getSequelize } from '@/db/connections'
import { syncProjectSpeciesCall } from './species-call'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  console.info('SYNCING: all project detections')
  try {
    const projects = await models.Project.findAll()
    // ARB QUERY: sync detections + sites + species of each projects
    for (const project of projects) {
      await Promise.all([syncProjectSpeciesCall(sequelize, project), wait(500)])
    }
  } catch (error) {
    console.error(error)
  }

  process.exit(0)
}

await main()
