import { type RichnessDatasetResponse } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'

import { type FilterDataset } from '~/datasets/dataset-types'
import { toFilterDatasetForSql } from '~/datasets/dataset-where'
import { getSequelize } from '../_services/db'
import { getRichnessBySite, getRichnessByTaxonClass, getRichnessByTimeDayOfWeek, getRichnessByTimeHourOfDay, getRichnessByTimeMonthOfYear, getRichnessByTimeUnix, getRichnessPresence } from './richness-dataset-dao'

export const getRichnessDataset = async (filter: FilterDataset, isProjectMember: boolean): Promise<RichnessDatasetResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const filterForSql = toFilterDatasetForSql(filter)

  const [richnessByTaxon, richnessBySite, richnessByTimeHourOfDay, richnessByTimeDayOfWeek, richnessByTimeMonthOfYear, richnessByTimeUnix, richnessPresence] = await Promise.all([
    await getRichnessByTaxonClass(models, sequelize, filterForSql),
    await getRichnessBySite(sequelize, filterForSql),
    await getRichnessByTimeHourOfDay(sequelize, filterForSql),
    await getRichnessByTimeDayOfWeek(sequelize, filterForSql),
    await getRichnessByTimeMonthOfYear(sequelize, filterForSql),
    await getRichnessByTimeUnix(sequelize, filterForSql),
    await getRichnessPresence(sequelize, filterForSql, isProjectMember)
  ])

  return {
    isLocationRedacted: !isProjectMember,
    richnessByTaxon,
    richnessBySite,
    richnessByTimeHourOfDay,
    richnessByTimeDayOfWeek,
    richnessByTimeMonthOfYear,
    richnessByTimeUnix,
    richnessPresence
  }
}
