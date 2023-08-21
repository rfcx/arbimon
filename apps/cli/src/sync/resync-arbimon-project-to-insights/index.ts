import { getSequelize } from '@/db/connections'
import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
import { syncProjectData } from '@/ingest/resync-project/sync-all'

const PROJECT_ID = process.env.PROJECT_ID

const main = async (): Promise<void> => {
  console.info('resync-arbimon-project-to-insights job start', PROJECT_ID)
  if (!PROJECT_ID) {
      return
  }
  const arbimonProjectId = Number(PROJECT_ID)
  try {
    const arbimonSequelize = getArbimonSequelize()
    const bioSequelize = getSequelize()

    console.info('STEP: Get projects, species, sites, recordings, detections')
    await syncProjectData(arbimonProjectId, arbimonSequelize, bioSequelize)

    console.info('resync-arbimon-project-to-insights job end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('resync-arbimon-project-to-insights job end: failed')
  }
}

await main()
