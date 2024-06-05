import { type Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type RecordingBySiteHour } from '@rfcx-bio/node-common/dao/types'

export type RecordingBySiteHourWithArbimonSiteId = RecordingBySiteHour & { siteIdArbimon: number }

export const getRecordingBySiteHours = async (sequelize: Sequelize, locationProjectId: number): Promise<RecordingBySiteHourWithArbimonSiteId[]> => {
  const { RecordingBySiteHour, LocationSite } = ModelRepository.getInstance(sequelize)
  const results = await RecordingBySiteHour.findAll({
    where: { locationProjectId },
    attributes: [[sequelize.col('LocationSite.id_arbimon'), 'siteIdArbimon'], 'locationSiteId', 'timePrecisionHourLocal', 'countsByMinute', 'totalDurationInMinutes'],
    include: [{
      model: LocationSite,
      attributes: []
    }],
    order: [[sequelize.col('LocationSite.id_arbimon'), 'ASC'], ['timePrecisionHourLocal', 'ASC']],
    raw: true
  }) as unknown as RecordingBySiteHourWithArbimonSiteId[]
  return results
}
