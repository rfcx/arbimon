import { type Sequelize } from 'sequelize'

import { type Sync } from '@rfcx-bio/common/api-bio/sync/sync-history'
import { type AllModels } from '@rfcx-bio/common/dao/model-repository'
import { type Site, type TaxonClass, ATTRIBUTES_LOCATION_SITE, ATTRIBUTES_TAXON_CLASS } from '@rfcx-bio/common/dao/types'

import dayjs from '@/../../../packages/utils/node_modules/dayjs'

export const getSites = async (models: AllModels, locationProjectId: number): Promise<Site[]> =>
  await models
    .LocationSite
    .findAll({
      where: { locationProjectId },
      attributes: ATTRIBUTES_LOCATION_SITE.light,
      order: [['name', 'ASC']],
      benchmark: true,
      logging: (sql, timing) => {
        console.info('project-filters', sql, timing)
      }
    })

// TODO: Filter to get only classes that exist in the project
export const getTaxonClasses = async (models: AllModels, locationProjectId: number): Promise<TaxonClass[]> =>
  await models
    .TaxonClass
    .findAll({
      attributes: ATTRIBUTES_TAXON_CLASS.light,
      order: [['id', 'ASC']],
      benchmark: true,
      logging: (sql, timing) => {
        console.info('project-filters', sql, timing)
      }
    })

export const getTimeBounds = async (models: AllModels, id: number): Promise<[string?, string?]> =>
  await models
    .LocationProjectMetric
    .findByPk(id, {
      benchmark: true,
      logging: (sql, timing) => {
        console.info('project-filters', sql, timing)
      }
    })
    .then(metric => [
      metric?.minDate ? dayjs(metric.minDate).toISOString() : undefined,
      metric?.maxDate ? dayjs(metric.maxDate).toISOString() : undefined
    ])

export const getLatestSync = async (models: AllModels, sequelize: Sequelize, locationProjectId: number): Promise<Sync | undefined> => {
  return await models.SyncLogByProject
    .findOne({
      attributes: [
        'id', 'createdAt', 'updatedAt', 'delta',
        [sequelize.col('SyncSource.name'), 'sourceType'],
        [sequelize.col('SyncDataType.name'), 'dataType']
      ],
      where: { locationProjectId },
      include: [
        {
          model: models.SyncSource,
          attributes: []
        },
        {
          model: models.SyncDataType,
          attributes: []
        }
      ],
      order: [['updatedAt', 'DESC']],
      raw: true,
      benchmark: true,
      logging: (sql, timing) => {
        console.info('project-filters', sql, timing)
      }
    }) as unknown as Sync | undefined
}
