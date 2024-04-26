import { getSequelize } from '@/db/connections'
import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
import { syncFixProject } from '@/ingest/resync-project/sync-fix-project'
import { requireEnv } from '~/env'

const { PROJECT_ID: projectId } = requireEnv('PROJECT_ID')

const main = async (): Promise<void> => {
  console.info('Sync fix project job start', projectId)
  try {
    const arbimonSequelize = getArbimonSequelize()
    const bioSequelize = getSequelize()

    await syncFixProject(projectId, arbimonSequelize, bioSequelize)

    console.info('Sync fix project job end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Sync fix project job end: failed')
  }
}

await main()
