import { type Sequelize } from 'sequelize'
import { type Literal } from 'sequelize/dist/lib/utils'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'

import { getSiteIdsFromQuerySiteNames } from '@/detect/jobs/detect-recording-bll'
import { getSequelize } from '~/db'

export interface RecordingsPerDay {
  date: string
  recordedMinutesCount: number
}

const getWhereClause = (sequelize: Sequelize, mainConditions: string[], startEndClause: string[]): Literal => {
  let mainConditionSql = mainConditions.join(' and ')

  if (startEndClause.length !== 0) {
    mainConditionSql = mainConditionSql.concat(' and ', '(', startEndClause.join(' and '), ')')
  }

  return sequelize.literal(mainConditionSql)
}

export const getRecordedMinutesPerDay = async (projectId: number, start?: Date, end?: Date, sites?: string): Promise<RecordingsPerDay[]> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)
  const siteIds = await getSiteIdsFromQuerySiteNames(models, projectId, sites ?? '')

  const mainConditions = [`"RecordingBySiteHour"."location_project_id" = ${projectId}`]
  const startEndClause = []

  if (start !== undefined) {
    startEndClause.push(`"RecordingBySiteHour"."time_precision_hour_local" >= '${start.toISOString()}'`)
  }

  if (end !== undefined) {
    startEndClause.push(`"RecordingBySiteHour"."time_precision_hour_local" <= '${end.toISOString()}'`)
  }

  if (siteIds.length > 0) {
    mainConditions.push(`"RecordingBySiteHour"."location_site_id" in (${siteIds.join(', ')})`)
  }

  const recordings = await models.RecordingBySiteHour.findAll({
    attributes: [
      [sequelize.fn('date', sequelize.col('time_precision_hour_local')), 'date'],
      [sequelize.fn('coalesce', sequelize.fn('sum', sequelize.col('total_duration_in_minutes')), 0), 'recordedMinutesCount']
    ],
    where: getWhereClause(sequelize, mainConditions, startEndClause),
    order: [
      [sequelize.fn('date', sequelize.col('time_precision_hour_local')), 'asc']
    ],
    group: [
      sequelize.fn('date', sequelize.col('time_precision_hour_local'))
    ],
    raw: true
  })

  // INFO: this does not look pretty but the `raw` flag will take care of all this.
  return recordings as unknown as RecordingsPerDay[]
}
