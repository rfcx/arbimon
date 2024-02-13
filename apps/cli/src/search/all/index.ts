import { type Client } from '@opensearch-project/opensearch'
import { type Sequelize } from 'sequelize'

import { analysis } from '../analysis'
import { PROJECTS_INDEX_NAME } from '../constants'
import { mappings } from '../mappings'
import { ensureRequiredIndexInitialized, refreshIndex } from '../opensearch'
import { getCurrentDatabaseTime, getProjects, saveOpensearchSyncStatus } from '../postgres'

export const syncAllProjects = async (client: Client, sequelize: Sequelize): Promise<void> => {
  console.info('- ensuring the index is present')
  await ensureRequiredIndexInitialized(client, PROJECTS_INDEX_NAME, { mappings, settings: { analysis } })

  console.info('- querying current database time as checkpoint')
  const currentDbTime = await getCurrentDatabaseTime(sequelize)

  console.info('- syncing deleted projects')
  const deletedProjects = await getProjects(sequelize, { type: 'deleted', time: undefined })
  for (const project of deletedProjects) {
    await client.delete({ index: PROJECTS_INDEX_NAME, id: project.id.toString() }).catch(e => {
      if (e.statusCode === 404) {
        console.info('- project id', project.id, 'already does not exist in opensearch')
      } else {
        throw e
      }
    })
  }
  console.info('- synced', deletedProjects.length, 'deleted projects')

  console.info('- syncing not deleted projects')
  const notDeletedProjects = await getProjects(sequelize)
  for (const project of notDeletedProjects) {
    const { id, ...body } = project
    await client.index({ index: PROJECTS_INDEX_NAME, id: id.toString(), body })
  }
  console.info('- synced', notDeletedProjects.length, 'not deleted projects')

  console.info('- saving the checkpoint to `sync_status` table for incremental sync')
  await saveOpensearchSyncStatus(sequelize, currentDbTime)
  console.info('- refreshing the index... if possible')
  await refreshIndex(client, PROJECTS_INDEX_NAME)
}
