import { getSequelize } from '@/db/connections'
import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
import { syncProjectData } from '@/ingest/resync-project/sync-all'
import { requireEnv } from '~/env'

const { ARBIMON_PROJECT_ID } = requireEnv('ARBIMON_PROJECT_ID')

const main = async (): Promise<void> => {
  console.info('recync-project job start', ARBIMON_PROJECT_ID)
  if (ARBIMON_PROJECT_ID === undefined) {
      return
  }
  const arbimonProjectId = Number(ARBIMON_PROJECT_ID)
  try {
    const arbimonSequelize = getArbimonSequelize()
    const bioSequelize = getSequelize()

    console.info('STEP: Get projects, species, sites, recordings, detections')
    await syncProjectData(arbimonProjectId, arbimonSequelize, bioSequelize)

    console.info('recync-project job end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('recync-project job end: failed')
  }
}

await main()
