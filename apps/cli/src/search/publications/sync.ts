import { type Client } from '@opensearch-project/opensearch'
import { type Dayjs } from 'dayjs'
import { type Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/node-common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { SYNC_BATCH_LIMIT } from '../constants'
import { deleteDocument, ensureRequiredIndexInitialized, refreshIndex } from '../opensearch/utilities'
import { getCurrentDatabaseTime } from '../postgres'
import { getEligiblePublications, getIneligiblePublications, PUBLICATIONS_INDEX_NAME } from './index'
import { getPublicationsMappings } from './mappings'

const indexBody = { mappings: getPublicationsMappings() }

const savePublicationsSyncStatus = async (sequelize: Sequelize, syncUntilDate: Dayjs): Promise<void> => {
  const { SyncStatus } = ModelRepository.getInstance(sequelize)
  const where = {
    syncSourceId: masterSources.NewArbimon.id,
    syncDataTypeId: masterSyncDataTypes.OpensearchPublications.id
  }
  const existing = await SyncStatus.findOne({ where })
  if (existing === null || existing === undefined) {
    await SyncStatus.create({ ...where, syncUntilDate: syncUntilDate.toDate(), syncUntilId: '0', syncBatchLimit: SYNC_BATCH_LIMIT })
  } else {
    await SyncStatus.update({ syncUntilDate: syncUntilDate.toDate() }, { where })
  }
}

const indexPublication = async (client: Client, doc: { id: number }): Promise<void> => {
  const { id, ...body } = doc
  await client.index({ index: PUBLICATIONS_INDEX_NAME, id: id.toString(), body })
}

export const syncAllPublications = async (client: Client, sequelize: Sequelize): Promise<void> => {
  console.info('- [publications] ensuring the index is present')
  await ensureRequiredIndexInitialized(client, PUBLICATIONS_INDEX_NAME, indexBody)

  console.info('- [publications] querying current database time as checkpoint')
  const currentDbTime = await getCurrentDatabaseTime(sequelize)

  console.info('- [publications] removing ineligible (hidden/pending) publications')
  const ineligible = await getIneligiblePublications(sequelize)
  for (const p of ineligible) {
    await deleteDocument(client, PUBLICATIONS_INDEX_NAME, p.id.toString())
  }
  console.info('- [publications] removed', ineligible.length, 'ineligible publications')

  console.info('- [publications] indexing eligible publications')
  const eligible = await getEligiblePublications(sequelize)
  for (const doc of eligible) {
    await indexPublication(client, doc)
  }
  console.info('- [publications] indexed', eligible.length, 'publications')

  await savePublicationsSyncStatus(sequelize, currentDbTime)
  await refreshIndex(client, PUBLICATIONS_INDEX_NAME)
}

export const syncAllPublicationsIncrementally = async (client: Client, sequelize: Sequelize): Promise<void> => {
  const { SyncStatus } = ModelRepository.getInstance(sequelize)

  console.info('- [publications] ensuring the index is present')
  await ensureRequiredIndexInitialized(client, PUBLICATIONS_INDEX_NAME, indexBody)

  const currentDbTime = await getCurrentDatabaseTime(sequelize)

  const checkpoint = await SyncStatus.findOne({
    where: {
      syncSourceId: masterSources.NewArbimon.id,
      syncDataTypeId: masterSyncDataTypes.OpensearchPublications.id
    }
  })

  if (checkpoint === null || checkpoint === undefined) {
    console.info('- [publications] no checkpoint found, performing full reindex')
    await syncAllPublications(client, sequelize)
    return
  }

  const since = dayjs(checkpoint.syncUntilDate)

  console.info('- [publications] removing publications that became ineligible since checkpoint')
  const ineligible = await getIneligiblePublications(sequelize, since)
  for (const p of ineligible) {
    await deleteDocument(client, PUBLICATIONS_INDEX_NAME, p.id.toString())
  }

  console.info('- [publications] indexing publications updated since checkpoint')
  const updated = await getEligiblePublications(sequelize, since)
  for (const doc of updated) {
    await indexPublication(client, doc)
  }
  console.info('- [publications] indexed', updated.length, 'updated publications')

  await savePublicationsSyncStatus(sequelize, currentDbTime)
  await refreshIndex(client, PUBLICATIONS_INDEX_NAME)
}
