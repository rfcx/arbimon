import { type Client } from '@opensearch-project/opensearch'
import { type Sequelize, QueryTypes } from 'sequelize'

import { syncAllProjects } from '../all'
import { PROJECTS_INDEX_NAME } from '../constants'
import { getAnalysis } from '../opensearch/analysis'
import { getMappings } from '../opensearch/mappings'
import { createIndex, deleteIndex, getAvailableIndexes } from '../opensearch/utilities'

export const recreateIndex = async (client: Client, index: string, body: object): Promise<void> => {
  console.info('- recreateIndex: getting available indexes from opensearch')
  const availableIndexes = await getAvailableIndexes(client)
  console.info('- recreateIndex: checking whether', index, 'index exists')
  const isProjectsIndexExists = availableIndexes.find(ai => ai.index === index)

  if (isProjectsIndexExists) {
    console.info('- recreateIndex: index', index, 'found, recreating the index')
    await deleteIndex(client, index)
    console.info('- recreateIndex: index', index, 'successfully deleted')
    await createIndex(client, index, body)
    console.info('- recreateIndex: index', index, 'successfully created')
  } else {
    console.info('- recreateIndex: index', index, 'not found, creating the index')
    await createIndex(client, index, body)
    console.info('- recreateIndex: index', index, 'successfully created')
  }
}

export const recreateIndexes = async (client: Client, sequelize: Sequelize): Promise<void> => {
  await recreateIndex(client, PROJECTS_INDEX_NAME, { mappings: getMappings(), settings: { analysis: getAnalysis() } })
  console.info('- finished recreating the index')

  console.info('- deleting the entry from sync_status to force a reindex')
  await sequelize.query('delete from sync_status where sync_source_id = 300 and sync_data_type_id = 800', { type: QueryTypes.DELETE })

  console.info('- finished deleting the entry from sync_status')
  console.info('- starting the full reindex')
  await syncAllProjects(client, sequelize)
}
