import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'
import { wait } from '@rfcx-bio/utils/async'

import { getArbimonSequelize } from '@/data-ingest/_connections/arbimon'
import { getSequelize } from '@/db/connections'
import { syncProjectSpeciesCall } from './species-call'

const main = async (): Promise<void> => {
  const sequelizeArbimon = getArbimonSequelize()
  const sequelizeBio = getSequelize()
  console.info('SYNCING: all project detections')
  try {
    const projects = await LocationProjectModel(sequelizeBio).findAll()
    // ARB QUERY: sync detections + sites + species of each projects
    for (const project of projects) {
      await Promise.all([syncProjectSpeciesCall(sequelizeArbimon, sequelizeBio, project), wait(500)])
    }
  } catch (error) {
    console.error(error)
  }

  process.exit(0)
}

await main()
