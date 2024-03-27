import { BioInvalidPathParamError } from '~/errors'
import { getRecordedMinutesPerDay as daoGetRecordedMinutesPerDay } from './get-recorded-minutes-per-day-dao'

export const getRecordedMinutesPerDay = async (projectId: string): Promise<Record<string, number>> => {
  if (projectId === undefined || projectId === '' || Number.isNaN(projectId)) {
    throw BioInvalidPathParamError({ projectId })
  }

  return await daoGetRecordedMinutesPerDay(Number(projectId))
}
