import { getArbimonSequelize } from '@/data-ingest/_connections/arbimon'
import { addProjectCoreIdInArbimon } from '@/integrity/sync-arbimon-projects-to-core/add-project-core-id-in-arbimon'
import { createProjectInCore } from '@/integrity/sync-arbimon-projects-to-core/create-project-in-core'
import { getDesyncedProjects } from '@/integrity/sync-arbimon-projects-to-core/get-desynced-projects'
import { mapProjectArbimonToCore } from '@/integrity/sync-arbimon-projects-to-core/map-project-arbimon-to-core'
import { ApiCoreClient } from '~/api-core/api-core-client'
import { requireEnv } from '~/env'

const { AUTHO_ANONYMOUS_CLIENT_SECRET, CORE_API_BASE_URL } = requireEnv('AUTHO_ANONYMOUS_CLIENT_SECRET', 'CORE_API_BASE_URL')
const SCRIPT_NAME = 'sync-arbimon-projects-to-core'
const SYNC_BATCH_LIMIT = 1 // 100

const main = async (): Promise<void> => {
  // Setup
  const sequelize = getArbimonSequelize()
  const apiClient = ApiCoreClient.getInstance(AUTHO_ANONYMOUS_CLIENT_SECRET)

  // Get projects
  const desyncedProjects = await getDesyncedProjects(sequelize, SYNC_BATCH_LIMIT)

  if (desyncedProjects.length === 0) return console.info(SCRIPT_NAME, 'No desynced projects')

  console.info(SCRIPT_NAME, `Found ${desyncedProjects.length} desynced projects, including: Arbimon ID ${desyncedProjects[0].project_id}: ${desyncedProjects[0].name}`)
  if (desyncedProjects.length === SYNC_BATCH_LIMIT) { console.warn(SCRIPT_NAME, `Sync hit batch limit of ${SYNC_BATCH_LIMIT}; run this script again to synchronize more`) }

  // Update projects
  for (const ap of desyncedProjects) {
    const idArbimon = ap.project_id

    console.info(SCRIPT_NAME, `Creating project ${idArbimon} in Core`)
    const idCore = await createProjectInCore(apiClient, CORE_API_BASE_URL, mapProjectArbimonToCore(ap))

    console.info(SCRIPT_NAME, `Saving project ${idArbimon} -> ${idCore} in Arbimon`)
    await addProjectCoreIdInArbimon(sequelize, idArbimon, idCore)
  }

  console.info(SCRIPT_NAME, 'Finished successfully')
}

await main()
  .catch(err => {
    console.error(err)
    process.exitCode = 1
  })
