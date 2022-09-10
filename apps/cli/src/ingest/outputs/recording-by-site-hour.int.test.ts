import { sum } from 'lodash-es'
import { beforeEach, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Site } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getSequelize } from '@/db/connections'
import { deleteOutputProjects } from '../_testing/helper'
import { ProjectArbimon } from '../parsers/parse-project-arbimon-to-bio'
import { writeRecordingBySiteHourToBio } from './recording-by-site-hour'

const biodiversitySequelize = await getSequelize()

describe('ingest > output > recording by site hour', () => {
  beforeEach(async () => {
    await biodiversitySequelize.query('DELETE FROM recording_by_site_hour')
    await deleteOutputProjects(biodiversitySequelize)

    // Batch project data before tests
    const PROJECT_INPUT: Omit<ProjectArbimon, 'id'> = {
      idArbimon: 1920,
      idCore: '807cuoi3cvw0',
      slug: 'rfcx-1',
      name: 'rfcx 1',
      latitudeNorth: 0,
      latitudeSouth: 0,
      longitudeEast: 0,
      longitudeWest: 0,
      deletedAt: null
    }
    await ModelRepository.getInstance(biodiversitySequelize).LocationProject.bulkCreate([PROJECT_INPUT])

    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: PROJECT_INPUT.idArbimon } })

    // Batch site data
    const SITE_INPUT: Array<Omit<Site, 'id'>> = [{
      idCore: 'cydwrzz91cbz',
      idArbimon: 88528,
      locationProjectId: project?.id ?? -1,
      name: 'Test Site',
      latitude: 16.742010693566815,
      longitude: 100.1923308193772,
      altitude: 0.0
    },
    {
      idCore: 'cydwrzz91cby',
      idArbimon: 88530,
      locationProjectId: project?.id ?? -1,
      name: 'Test Site 2',
      latitude: 16.742010693566815,
      longitude: 100.1923308193772,
      altitude: 0.0
    }]

    await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate(SITE_INPUT)
  })

  const RECORDING_INPUT = [
    {
      projectIdArbimon: 1,
      siteIdArbimon: 88528,
      datetime: '2022-07-06 07:00:00',
      duration: 60.25,
      idArbimon: 1001,
      updatedAt: '2022-07-06 16:00:00'
    },
    {
      projectIdArbimon: 1,
      siteIdArbimon: 88528,
      datetime: '2022-07-06 07:00:00',
      duration: 60.25,
      idArbimon: 1002,
      updatedAt: '2022-07-06 16:00:00'
    }
  ]
  test('can write new recording by site hour', async () => {
    // Act
    await writeRecordingBySiteHourToBio(RECORDING_INPUT, biodiversitySequelize)

    // Assert
    const recordingBySiteHour = await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour.findAll()
    expect(recordingBySiteHour.length).toBe(1)
    expect(recordingBySiteHour[0].totalDurationInMinutes).toBe(2.01)
    expect(recordingBySiteHour[0].countsByMinute).toEqual([[0, 2]])
    expect(recordingBySiteHour[0].count).toEqual(1)
    expect(dayjs(recordingBySiteHour[0].timePrecisionHourLocal)).toEqual(dayjs('2022-07-06T07:00:00.000Z'))
  })

  test('update recorded minutes if location project, location site, and time precision hour local are the same', async () => {
    // Arrange
    const NEW_RECORDS = [
      // recording to update existing row
      {
        projectIdArbimon: 1,
        siteIdArbimon: 88528,
        datetime: '2022-07-06 07:20:00',
        duration: 60,
        idArbimon: 1003,
        updatedAt: '2022-07-06 18:00:00'
      },
      // new row
      {
        projectIdArbimon: 1,
        siteIdArbimon: 88528,
        datetime: '2022-07-06 19:20:00',
        duration: 60,
        idArbimon: 1004,
        updatedAt: '2022-07-06 18:30:00'
      }
    ]

    // Act
    await writeRecordingBySiteHourToBio(RECORDING_INPUT, biodiversitySequelize)
    await writeRecordingBySiteHourToBio(NEW_RECORDS, biodiversitySequelize)

    // Assert
    const recordingBySiteHour = await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour.findAll({ raw: true })

    expect(recordingBySiteHour.length).toBe(2)
    expect(recordingBySiteHour[0].countsByMinute).toEqual([0, 3])
    expect(sum(recordingBySiteHour.map(item => item.count))).toBe(2)
  })

  test('can write new recordings by site hour for different sites', async () => {
    // Arrange
    const NEW_RECORDS = [
      {
        projectIdArbimon: 1,
        siteIdArbimon: 88530,
        datetime: '2022-07-06 07:20:00',
        duration: 60,
        idArbimon: 1003,
        updatedAt: '2022-07-06 18:00:00'
      },
      {
        projectIdArbimon: 1,
        siteIdArbimon: 88530,
        datetime: '2022-07-06 19:20:00',
        duration: 60,
        idArbimon: 1004,
        updatedAt: '2022-07-06 18:30:00'
      }
    ]

    // Act
    await writeRecordingBySiteHourToBio([...RECORDING_INPUT, ...NEW_RECORDS], biodiversitySequelize)

    // Assert
    const recordingBySiteHour = await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour.findAll()

    expect(recordingBySiteHour.length).toBe(3)
    expect(dayjs(recordingBySiteHour[0].timePrecisionHourLocal)).toEqual(dayjs('2022-07-06T07:00:00.000Z'))
    expect(dayjs(recordingBySiteHour[1].timePrecisionHourLocal)).toEqual(dayjs('2022-07-06T07:00:00.000Z'))
    expect(dayjs(recordingBySiteHour[2].timePrecisionHourLocal)).toEqual(dayjs('2022-07-06T19:00:00.000Z'))
  })
})
