import { type BindOrReplacements, type Sequelize, QueryTypes } from 'sequelize'

import { type ProjectRecordingCountResponse, type SitesRecCountAndDates } from '@rfcx-bio/common/api-bio/project/project-recordings'
import { type Sync } from '@rfcx-bio/common/api-bio/sync/sync-history'
import { type AllModels } from '@rfcx-bio/common/dao/model-repository'
import { type Site, type TaxonClass, ATTRIBUTES_LOCATION_SITE, ATTRIBUTES_TAXON_CLASS } from '@rfcx-bio/common/dao/types'

import dayjs from '@/../../../packages/utils/node_modules/dayjs'
import { getSequelize } from '~/db'

const sequelize = getSequelize()

export const getSites = async (models: AllModels, locationProjectId: number): Promise<Site[]> =>
  await models
    .LocationSite
    .findAll({
      where: { locationProjectId },
      attributes: ATTRIBUTES_LOCATION_SITE.light,
      order: [['name', 'ASC']]
    })

// TODO: Filter to get only classes that exist in the project
export const getTaxonClasses = async (models: AllModels, locationProjectId: number): Promise<TaxonClass[]> =>
  await models
    .TaxonClass
    .findAll({
      attributes: ATTRIBUTES_TAXON_CLASS.light,
      order: [['id', 'ASC']]
    })

export const getTimeBounds = async (models: AllModels, id: number): Promise<[string?, string?]> =>
  await models
    .LocationProjectMetric
    .findByPk(id)
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
      raw: true
    }) as unknown as Sync | undefined
}

export const getRecordingCount = async (locationProjectId: number): Promise<number> => {
  const bind: BindOrReplacements = {
    locationProjectId
  }
  const sql = `
    SELECT sum(rbsh.count)::integer as count
    FROM recording_by_site_hour rbsh
    WHERE rbsh.location_project_id = ${locationProjectId};
  `
  const result = await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as ProjectRecordingCountResponse[]
  return result[0].count
}

export const getSitesRecordingCountAndDates = async (locationProjectId: number): Promise<SitesRecCountAndDates[]> => {
  const bind: BindOrReplacements = {
    locationProjectId
  }
  const sql = `
    SELECT rbsh.location_site_id as id,
      sum(rbsh.count)::integer as recordings,
      count(DISTINCT rbsh.time_precision_hour_local::date)::integer as days
    FROM recording_by_site_hour rbsh
    WHERE rbsh.location_project_id = ${locationProjectId}
    GROUP BY rbsh.location_site_id
  `
  const result = await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as SitesRecCountAndDates[]
  return result
}