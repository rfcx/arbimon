import { type getRecordedMinutesPerDayParams, type GetRecordedMinutesPerDayResponse } from '@rfcx-bio/common/api-bio/cnn/recorded-minutes-per-day'

import { type Handler } from '~/api-helpers/types'
import { getRecordedMinutesPerDay } from './get-recorded-minutes-per-day-bll'

export const getRecordedMinutesPerDayHandler: Handler<GetRecordedMinutesPerDayResponse, getRecordedMinutesPerDayParams> = async (req) => {
  return await getRecordedMinutesPerDay(req.params.projectId)
}
