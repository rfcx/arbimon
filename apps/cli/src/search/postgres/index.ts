import { type Dayjs } from 'dayjs'
import { type Sequelize, QueryTypes } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/node-common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { SYNC_BATCH_LIMIT } from '../constants'

export const getCurrentDatabaseTime = async (sequelize: Sequelize): Promise<Dayjs> => {
  const time = await sequelize.query<{ now: string }>('select now() as "now"', {
    plain: true,
    type: QueryTypes.SELECT
  })

  return dayjs(time.now)
}

export const saveOpensearchSyncStatus = async (sequelize: Sequelize, syncUntilDate: Dayjs): Promise<void> => {
  const { SyncStatus } = ModelRepository.getInstance(sequelize)

  const latestSyncCheckpoint = await SyncStatus.findOne({
    where: {
      syncSourceId: masterSources.NewArbimon.id,
      syncDataTypeId: masterSyncDataTypes.Opensearch.id
    }
  })

  if (latestSyncCheckpoint === null || latestSyncCheckpoint === undefined) {
    console.info('- latest `sync_status` checkpoint not found. Creating new checkpoint')
    await SyncStatus.create({
      syncSourceId: masterSources.NewArbimon.id,
      syncDataTypeId: masterSyncDataTypes.Opensearch.id,
      syncUntilDate: syncUntilDate.toDate(),
      syncUntilId: '0',
      syncBatchLimit: SYNC_BATCH_LIMIT
    })
  } else {
    console.info('- latest `sync_status` checkpoint found. Updating the date for the checkpoint')
    await SyncStatus.update(
      {
        syncUntilDate: syncUntilDate.toDate()
      },
      {
        where: {
          syncSourceId: masterSources.NewArbimon.id,
          syncDataTypeId: masterSyncDataTypes.Opensearch.id
        }
      }
    )
  }
}
