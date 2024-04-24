import { getSequelize } from '@/db/connections'
import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
import { syncProject } from '@/ingest/resync-project/sync-project'
import { requireEnv } from '~/env'

const { ARBIMON_PROJECT_ID } = requireEnv('ARBIMON_PROJECT_ID')

const main = async (): Promise<void> => {
  console.info('Sync fix project full job start', ARBIMON_PROJECT_ID)
  if (ARBIMON_PROJECT_ID === undefined) {
      return
  }
  const arbimonProjectId = Number(ARBIMON_PROJECT_ID)
  try {
    const arbimonSequelize = getArbimonSequelize()
    const bioSequelize = getSequelize()

    console.info('STEP: Get sites, species calls, recordings, detections')
    await syncProject(arbimonProjectId, arbimonSequelize, bioSequelize)

    console.info('Sync fix project full job end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Sync fix project full job end: failed')
  }
}

await main()
