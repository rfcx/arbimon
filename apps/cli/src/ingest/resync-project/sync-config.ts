import { type Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type SyncStatus } from '@rfcx-bio/node-common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

export type SyncConfig = Pick<SyncStatus, 'syncSourceId' | 'syncDataTypeId' | 'syncBatchLimit'>

export const getDefaultSyncStatus = (syncConfig: SyncConfig): SyncStatus =>
  ({
    ...syncConfig,
    syncUntilDate: dayjs('1980-01-01T00:00:00.000Z').toDate(),
    syncUntilId: '0'
  })

export const getBiodiversityProjectId = async (arbimonProjectId: number, sequelize: Sequelize): Promise<number> => {
  const [bioProjectId] = await ModelRepository.getInstance(sequelize).LocationProject.findAll({
    where: { idArbimon: arbimonProjectId },
    attributes: ['id'],
    raw: true
  })
  return bioProjectId.id
}

export const getArbimonProjectId = async (locationProjectId: number, sequelize: Sequelize): Promise<number> => {
  const project = await ModelRepository.getInstance(sequelize).LocationProject.findOne({
    where: { id: locationProjectId },
    attributes: ['idArbimon'],
    raw: true
  })
  if (project === null) throw Error('Project not found')
  return project.idArbimon
}
