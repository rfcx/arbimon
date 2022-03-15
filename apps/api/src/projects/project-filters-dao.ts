import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_LOCATION_SITE, ATTRIBUTES_TAXON_CLASS, Datasource, Site, TaxonClass } from '@rfcx-bio/common/dao/types'

import dayjs from '@/../../../packages/utils/node_modules/dayjs'

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

export const getLatestUpdatedProject = async (models: AllModels, locationProjectId: number): Promise<Datasource[]> =>
  await models
    .Datasource
    .findAll({
      attributes: ['id', ['updated_at', 'updatedAt'], 'summary_text'],
      where: {
        locationProjectId: locationProjectId
      },
      order: [['updatedAt', 'ASC']]
    })
