import { type Dayjs } from 'dayjs'
import { type Sequelize, QueryTypes } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { BASE_SQL, SYNC_BATCH_LIMIT } from './constants'

export const getProjects = async (sequelize: Sequelize, constraint?: { type: 'deleted' | 'updated', time?: Dayjs }): Promise<Array<{ id: number, name: string }>> => {
  let offset = 0
  let totalCount = 0
  let responseCount = 1

  let completeSql = BASE_SQL

  if (constraint?.type === 'deleted') {
    if (constraint?.time) {
      console.info('- querying projects that are deleted after', constraint?.time?.toISOString())
      completeSql += ' and location_project.deleted_at >= :latest_sync_date'
    } else {
      console.info('- querying all deleted projects')
      completeSql += ' and location_project.deleted_at is not null'
    }
  } else {
    console.info('- querying all not deleted projects')
    completeSql += ' and location_project.deleted_at is null'
  }

  if (constraint?.type === 'updated') {
    if (constraint?.time) {
      console.info('- querying updated projects after', constraint?.time?.toISOString())
      completeSql += ' and location_project.updated_at >= :latest_sync_date'
    }
  }

  completeSql += ' limit :limit offset :offset'

  const projectList: Array<{ id: number, name: string }> = []

  while (responseCount !== 0) {
    console.info('- querying projects between limit', SYNC_BATCH_LIMIT, 'and offset', offset)
    const projects = await sequelize.query<{ id: number, name: string }>(completeSql, {
      raw: true,
      replacements: {
        limit: SYNC_BATCH_LIMIT,
        offset,
        latest_sync_date: constraint?.time?.toISOString() ?? null
      },
      type: QueryTypes.SELECT
    })

    totalCount += projects.length
    offset += SYNC_BATCH_LIMIT
    responseCount = projects.length

    console.info('- found', projects.length, 'projects between limit', SYNC_BATCH_LIMIT, 'and offset', offset)
    projectList.push(...projects)
  }

  console.info('- found', totalCount, 'projects in total')
  return projectList
}

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
