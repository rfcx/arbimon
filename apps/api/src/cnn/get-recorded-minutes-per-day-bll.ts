import { type Dayjs } from 'dayjs'

import { type GetRecordedMinutesPerDayQueryParams } from '@rfcx-bio/common/api-bio/cnn/recorded-minutes-per-day'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { BioInvalidPathParamError, BioPublicError } from '~/errors'
import { getRecordedMinutesPerDay as daoGetRecordedMinutesPerDay } from './get-recorded-minutes-per-day-dao'

export const getRecordedMinutesPerDay = async (projectId: string, query: GetRecordedMinutesPerDayQueryParams): Promise<Array<{ date: string, recordedMinutesCount: number }>> => {
  if (projectId === undefined || projectId === '' || Number.isNaN(projectId)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const parsedDates: { start: Dayjs | undefined, end: Dayjs | undefined } = {
    start: undefined,
    end: undefined
  }

  if (query?.start !== undefined && query.start !== '' && dayjs(query.start).isValid()) {
    parsedDates.start = dayjs(query.start).startOf('day')
  }

  if (query?.end !== undefined && query.end !== '' && dayjs(query.end).isValid()) {
    parsedDates.end = dayjs(query.end).endOf('day')
  }

  if (parsedDates.start !== undefined && parsedDates.end !== undefined) {
    if (parsedDates.end.isBefore(parsedDates.start)) {
      throw new BioPublicError('Property `end` is greater than `start`', 400)
    }
  }

  return await daoGetRecordedMinutesPerDay(
    Number(projectId),
    parsedDates.start !== undefined ? parsedDates.start.toDate() : undefined,
    parsedDates.end !== undefined ? parsedDates.end.toDate() : undefined,
    query?.sites
  )
}
