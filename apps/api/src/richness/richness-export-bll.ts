import { RichnessExportResponse } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { FilterDataset } from '~/datasets/dataset-types'
import { toFilterDatasetForSql } from '~/datasets/dataset-where'
import { getSequelize } from '../_services/db'
import { getRichnessExportData } from './richness-export-dao'

export const getRichnessExport = async (filter: FilterDataset, isProjectMember: boolean): Promise<RichnessExportResponse> => {
  const sequelize = getSequelize()

  const filterForSql = toFilterDatasetForSql(filter)

  const richnessExport = await getRichnessExportData(sequelize, filterForSql, isProjectMember)

  return {
    richnessExport
  }
}
