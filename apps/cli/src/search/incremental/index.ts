import { type Client } from '@opensearch-project/opensearch'
import { type Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/node-common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { syncAllProjects } from '../all'
import { PROJECTS_INDEX_NAME } from '../constants'
import { getAnalysis } from '../opensearch/analysis'
import { getMappings } from '../opensearch/mappings'
import { deleteDocument, ensureRequiredIndexInitialized, refreshIndex } from '../opensearch/utilities'
import { getCurrentDatabaseTime, saveOpensearchSyncStatus } from '../postgres'
import { getProjects } from '../projects'

export const syncAllProjectsIncrementally = async (client: Client, sequelize: Sequelize): Promise<void> => {
  const { SyncStatus } = ModelRepository.getInstance(sequelize)

  console.info('- ensuring the index is present')
  await ensureRequiredIndexInitialized(client, PROJECTS_INDEX_NAME, { mappings: getMappings(), settings: { analysis: getAnalysis() } })

  console.info('- querying current database time as checkpoint')
  const currentDbTime = await getCurrentDatabaseTime(sequelize)

  console.info('- querying `sync_status` checkpoint')
  const latestSyncCheckpoint = await SyncStatus.findOne({
    where: {
      syncSourceId: masterSources.NewArbimon.id,
      syncDataTypeId: masterSyncDataTypes.Opensearch.id
    }
  })

  if (latestSyncCheckpoint === null || latestSyncCheckpoint === undefined) {
    console.info('- latest `sync_status` checkpoint not found. Performing full reindex')
    await syncAllProjects(client, sequelize)
    return
  }

  console.info('- syncing deleted projects')
  const deletedProjects = await getProjects(sequelize, 'eligible', { type: 'deleted', time: dayjs(latestSyncCheckpoint.syncUntilDate) })
  for (const project of deletedProjects) {
    await deleteDocument(client, PROJECTS_INDEX_NAME, project.id.toString())
  }

  console.info('- syncing non-eligible projects (removing recently hidden/unlisted projects out of opensearch)')
  const nonEligibleProjects = await getProjects(sequelize, 'non-eligible', { type: 'updated', time: dayjs(latestSyncCheckpoint.syncUntilDate) })
  for (const project of nonEligibleProjects) {
    await deleteDocument(client, PROJECTS_INDEX_NAME, project.id.toString())
  }

  console.info('- syncing updated projects')
  const updatedProjects = await getProjects(sequelize, 'eligible', { type: 'updated', time: dayjs(latestSyncCheckpoint.syncUntilDate) })
  for (const project of updatedProjects) {
    const { id, ...body } = project
    await client.index({ index: PROJECTS_INDEX_NAME, id: id.toString(), body })
  }

  console.info('- saving the checkpoint to `sync_status` table for incremental sync')
  await saveOpensearchSyncStatus(sequelize, currentDbTime)
  console.info('- refreshing the index... if possible')
  await refreshIndex(client, PROJECTS_INDEX_NAME)
}
