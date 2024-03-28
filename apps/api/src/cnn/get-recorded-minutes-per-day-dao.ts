import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const getRecordedMinutesPerDay = async (projectId: number): Promise<Record<string, number>> => {
  const sequelize = getSequelize()
  const { RecordingBySiteHour } = ModelRepository.getInstance(sequelize)

  const recordings = await RecordingBySiteHour.findAll({
    attributes: [
      [sequelize.fn('date', sequelize.col('time_precision_hour_local')), 'date'],
      [sequelize.fn('coalesce', sequelize.fn('sum', sequelize.col('total_duration_in_minutes')), 0), 'recordedMinutes']
    ],
    where: {
      locationProjectId: projectId
    },
    order: [
      [sequelize.fn('date', sequelize.col('time_precision_hour_local')), 'asc']
    ],
    group: [
      sequelize.fn('date', sequelize.col('time_precision_hour_local'))
    ]
  })

  return Object.fromEntries(recordings.map(r => {
    return [r.get('date'), r.get('recordedMinutes')]
  }))
}
