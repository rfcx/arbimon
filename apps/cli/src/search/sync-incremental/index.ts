import { type Client } from '@opensearch-project/opensearch'
import { type Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { analysis } from '../analysis'
import { PROJECTS_INDEX_NAME, SYNC_DATA_TYPE_ID, SYNC_SOURCE_ID } from '../constants'
import { mappings } from '../mappings'
import { ensureRequiredIndexInitialized, refreshIndex } from '../opensearch'
import { getCurrentDatabaseTime, getProjects, saveOpensearchSyncStatus } from '../postgres'
import { syncAllProjects } from '../sync-all'

export const syncAllProjectsIncrementally = async (client: Client, sequelize: Sequelize): Promise<void> => {
  const { SyncStatus } = ModelRepository.getInstance(sequelize)

  console.info('- ensuring the index is present')
  await ensureRequiredIndexInitialized(client, PROJECTS_INDEX_NAME, { mappings, settings: { analysis } })

  console.info('- querying current database time as checkpoint')
  const currentDbTime = await getCurrentDatabaseTime(sequelize)

  console.info('- querying `sync_status` checkpoint')
  const latestSyncCheckpoint = await SyncStatus.findOne({
    where: {
      syncSourceId: SYNC_SOURCE_ID,
      syncDataTypeId: SYNC_DATA_TYPE_ID
    }
  })

  if (latestSyncCheckpoint === null || latestSyncCheckpoint === undefined) {
    console.info('- latest `sync_status` checkpoint not found. Performing full reindex')
    await syncAllProjects(client, sequelize)
    return
  }

  const deletedProjects = await getProjects(sequelize, { type: 'deleted', time: dayjs(latestSyncCheckpoint.syncUntilDate) })
  for (const project of deletedProjects) {
    await client.delete({ index: PROJECTS_INDEX_NAME, id: project.id.toString() }).catch(e => {
      if (e.statusCode === 404) {
        console.info('- project id', project.id, 'already does not exist in opensearch')
      } else {
        throw e
      }
    })
  }

  const updatedProjects = await getProjects(sequelize, { type: 'updated', time: dayjs(latestSyncCheckpoint.syncUntilDate) })
  for (const project of updatedProjects) {
    const { id, ...body } = project
    await client.index({ index: PROJECTS_INDEX_NAME, id: id.toString(), body })
  }

  console.info('- saving the checkpoint to `sync_status` table for incremental sync')
  await saveOpensearchSyncStatus(sequelize, currentDbTime)
  console.info('- refreshing the index... if possible')
  await refreshIndex(client, PROJECTS_INDEX_NAME)
}
