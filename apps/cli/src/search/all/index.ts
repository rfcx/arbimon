import { type Client } from '@opensearch-project/opensearch'
import { type Sequelize } from 'sequelize'

import { PROJECTS_INDEX_NAME } from '../constants'
import { getAnalysis } from '../opensearch/analysis'
import { getMappings } from '../opensearch/mappings'
import { deleteDocument, ensureRequiredIndexInitialized, refreshIndex } from '../opensearch/utilities'
import { getCurrentDatabaseTime, saveOpensearchSyncStatus } from '../postgres'
import { getProjects } from '../projects'

export const syncAllProjects = async (client: Client, sequelize: Sequelize): Promise<void> => {
  console.info('- ensuring the index is present')
  await ensureRequiredIndexInitialized(client, PROJECTS_INDEX_NAME, { mappings: getMappings(), settings: { analysis: getAnalysis() } })

  console.info('- querying current database time as checkpoint')
  const currentDbTime = await getCurrentDatabaseTime(sequelize)

  console.info('- syncing deleted projects')
  const deletedProjects = await getProjects(sequelize, 'eligible', { type: 'deleted', time: undefined })
  for (const project of deletedProjects) {
    await deleteDocument(client, PROJECTS_INDEX_NAME, project.id.toString())
  }
  console.info('- synced/removed', deletedProjects.length, 'deleted projects')

  console.info('- syncing non-eligible projects')
  const nonEligibleProjects = await getProjects(sequelize, 'non-eligible')
  for (const project of nonEligibleProjects) {
    await deleteDocument(client, PROJECTS_INDEX_NAME, project.id.toString())
  }
  console.info('- synced/removed', nonEligibleProjects.length, 'non-eligible projects')

  console.info('- syncing not deleted projects')
  const notDeletedProjects = await getProjects(sequelize, 'eligible')
  for (const project of notDeletedProjects) {
    const { id, ...body } = project
    await client.index({ index: PROJECTS_INDEX_NAME, id: id.toString(), body })
  }
  console.info('- synced/indexed', notDeletedProjects.length, 'not deleted projects')

  console.info('- saving the checkpoint to `sync_status` table for incremental sync')
  await saveOpensearchSyncStatus(sequelize, currentDbTime)
  console.info('- refreshing the index... if possible')
  await refreshIndex(client, PROJECTS_INDEX_NAME)
}
