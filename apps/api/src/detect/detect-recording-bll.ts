import { range } from 'lodash-es'
import { Op } from 'sequelize'

import { DetectRecordingQueryParams, DetectRecordingResponse } from '@rfcx-bio/common/api-bio/detect/detect-recording'
import { AllModels, ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { dayjs } from '~/dayjs-initialized'
import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'
import { getDetectRecordingTotalDurationMinutes, getProjectById, getSitesByNameQuery } from './detect-recording-dao'

export interface DetectRecordingQuery {
  locationProjectId: number
  dateStartLocal: string
  dateEndLocal: string
  siteIds?: number[]
  hours?: number[]
}

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export const getDetectRecording = async (locationProjectId: number, detectRecordingQueryParams: DetectRecordingQueryParams): Promise<DetectRecordingResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const { dateStartLocal, dateEndLocal, querySites, queryHours } = detectRecordingQueryParams

  const isProjectExist = await getProjectById(models, locationProjectId)
  if (!isProjectExist) throw BioNotFoundError()

  const query: DetectRecordingQuery = {
    locationProjectId,
    dateStartLocal: dayjs(dateStartLocal).utc().startOf('day').format(DATE_FORMAT),
    dateEndLocal: dayjs(dateEndLocal).endOf('day').format(DATE_FORMAT)
  }

  if (querySites) {
    query.siteIds = await getSiteIdsFromQuerySiteNames(models, locationProjectId, querySites)
  }

  if (queryHours) {
    query.hours = getHoursFromQueryHours(queryHours)
  }

  const [totalDurationInMinutes] = await Promise.all([
    getDetectRecordingTotalDurationMinutes(models, sequelize, query)
  ])

  return {
    ...totalDurationInMinutes
  }
}

export const getHoursFromQueryHours = (queryHour: string): number[] => {
  const hourGroupString = queryHour.split(',')
  const hours: number[] = []
  for (const hourString of hourGroupString) {
    const hourNumber = Number(hourString)
    if (!Number.isNaN(hourNumber)) {
      hours.push(hourNumber)
      continue
    }

    const [number1, number2] = hourString.split('-').map(Number)
      if (number1 <= number2) {
        hours.push(...range(number1, number2 + 1))
      } else {
        hours.push(...range(number1, 24), ...range(0, number2 + 1))
      }
  }
  return hours
}

export const getSiteIdsFromQuerySiteNames = async (models: AllModels, locationProjectId: number, querySites: string): Promise<number[]> => {
  const querySiteNames = querySites.split(',').map(n => n.replace(/^\*/, '%').replace(/\*$/, '%'))
  const queryWithArray = querySiteNames.filter(n => !n.startsWith('%') && !n.endsWith('%'))
  const queryWithLike = querySiteNames.filter(n => n.startsWith('%') || n.endsWith('%'))
  const result: number[] = []

  if (queryWithArray.length > 0) {
    const queryWithArrayResult = await getSitesByNameQuery(models, locationProjectId, queryWithArray)
    result.push(...queryWithArrayResult)
  }

  if (queryWithLike.length > 0) {
    const queryWithLikeResults = await Promise.all(queryWithLike.map(async q => await getSitesByNameQuery(models, locationProjectId, { [Op.like]: q })))
    result.push(...queryWithLikeResults.flat())
  }

  return result
}
