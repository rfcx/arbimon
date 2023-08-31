import { sum } from 'lodash-es'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type Site } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getSequelize } from '@/db/connections'
import { deleteOutputProjects } from '../_testing/helper'
import { type ProjectArbimon } from '../parsers/parse-project-arbimon-to-bio'
import { mapRecordingBySiteHourArbimonWithPrevSync, writeRecordingBySiteHourToBio } from './resync-recording-by-site-hour'

const biodiversitySequelize = getSequelize()

describe('ingest > output > resync recording by site hour', () => {
  beforeAll(async () => {
    await biodiversitySequelize.query('DELETE FROM recording_by_site_hour')
    await deleteOutputProjects(biodiversitySequelize)
    // Batch project data before tests
    const PROJECT_INPUT: Omit<ProjectArbimon, 'id'> = {
      idArbimon: 1920,
      idCore: '807cuoi3cvw0',
      slug: 'rfcx-1',
      name: 'rfcx 1',
      isPrivate: 0,
      latitudeNorth: 0,
      latitudeSouth: 0,
      longitudeEast: 0,
      longitudeWest: 0,
      updatedAt: new Date(),
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
      siteIdArbimon: 88528,
      datetime: '2022-07-06 07:00:00',
      duration: 60,
      idArbimon: 1001,
      updatedAt: '2022-07-06 16:00:00'
    },
    {
      siteIdArbimon: 88528,
      datetime: '2022-07-06 07:10:00',
      duration: 30,
      idArbimon: 1002,
      updatedAt: '2022-07-06 16:00:00'
    }
  ]

  afterAll(async () => {
    await biodiversitySequelize.query('DELETE FROM recording_by_site_hour')
    await deleteOutputProjects(biodiversitySequelize)
  })

  // ------------ Group recordings by site hour ----------

  test('can group first recording by site hour', async () => {
    // Act
    const recordingBySiteHour = await mapRecordingBySiteHourArbimonWithPrevSync(RECORDING_INPUT, biodiversitySequelize)

    // Assert
    expect(recordingBySiteHour).toHaveLength(1)
    expect(recordingBySiteHour[0].totalDurationInMinutes).toBe(1.50)
    expect(recordingBySiteHour[0].countsByMinute).toEqual([[0, 1], [10, 1]])
    expect(recordingBySiteHour[0].count).toEqual(2)
    expect(dayjs(recordingBySiteHour[0].timePrecisionHourLocal)).toEqual(dayjs('2022-07-06T07:00:00.000Z'))
  })

  test('can group next recording by site hour', async () => {
    // Arrange
    const NEW_RECORDS = [
      {
        siteIdArbimon: 88528,
        datetime: '2022-07-07 19:20:00',
        duration: 20,
        idArbimon: 1004,
        updatedAt: '2022-07-06 18:30:00'
      }
    ]

    // Act
    const recordingBySiteHour = await mapRecordingBySiteHourArbimonWithPrevSync(NEW_RECORDS, biodiversitySequelize)

    // Assert
    expect(recordingBySiteHour).toHaveLength(2)
    expect(dayjs(recordingBySiteHour[1].timePrecisionHourLocal)).toEqual(dayjs('2022-07-07T19:00:00.000Z'))
    expect(recordingBySiteHour[1].totalDurationInMinutes).toBe(0.34)
    expect(recordingBySiteHour[1].countsByMinute).toEqual([[20, 1]])
    expect(sum(recordingBySiteHour.map(item => item.count))).toBe(3)
  })

  test('can update/increase countsByMinute with the same/existing recording time', async () => {
    // Arrange
    const NEW_RECORDS = [
      // recording to update existing row
      {
        siteIdArbimon: 88528,
        datetime: '2022-07-06 07:10:00',
        duration: 20,
        idArbimon: 1003,
        updatedAt: '2022-07-06 18:00:00'
      }
    ]

     // Act
     const recordingBySiteHour = await mapRecordingBySiteHourArbimonWithPrevSync(NEW_RECORDS, biodiversitySequelize)

     // Assert
     expect(recordingBySiteHour).toHaveLength(2)
     expect(dayjs(recordingBySiteHour[0].timePrecisionHourLocal)).toEqual(dayjs('2022-07-06T07:00:00.000Z'))
     expect(dayjs(recordingBySiteHour[1].timePrecisionHourLocal)).toEqual(dayjs('2022-07-07T19:00:00.000Z'))
     expect(recordingBySiteHour[0].totalDurationInMinutes).toBe(1.84)
     expect(recordingBySiteHour[1].totalDurationInMinutes).toBe(0.34)
     expect(recordingBySiteHour[0].countsByMinute).toEqual([[0, 1], [10, 2]])
     expect(recordingBySiteHour[1].countsByMinute).toEqual([[20, 1]])
     expect(sum(recordingBySiteHour.map(item => item.count))).toBe(3)
  })

  test('can group new recordings by site hour for different sites', async () => {
    // Arrange
    const NEW_RECORDS = [
      {
        siteIdArbimon: 88530,
        datetime: '2022-07-06 07:20:00',
        duration: 60,
        idArbimon: 1003,
        updatedAt: '2022-07-06 18:00:00'
      },
      {
        siteIdArbimon: 88530,
        datetime: '2022-07-08 19:10:00',
        duration: 60,
        idArbimon: 1004,
        updatedAt: '2022-07-06 18:30:00'
      }
    ]

    // Act
    const recordingBySiteHour = await mapRecordingBySiteHourArbimonWithPrevSync(NEW_RECORDS, biodiversitySequelize)

    // Assert
    expect(recordingBySiteHour).toHaveLength(4)
    expect(dayjs(recordingBySiteHour[0].timePrecisionHourLocal)).toEqual(dayjs('2022-07-06T07:00:00.000Z'))
    expect(dayjs(recordingBySiteHour[1].timePrecisionHourLocal)).toEqual(dayjs('2022-07-07T19:00:00.000Z'))
    expect(dayjs(recordingBySiteHour[2].timePrecisionHourLocal)).toEqual(dayjs('2022-07-06T07:00:00.000Z'))
    expect(dayjs(recordingBySiteHour[3].timePrecisionHourLocal)).toEqual(dayjs('2022-07-08T19:00:00.000Z'))
    expect(recordingBySiteHour[0].totalDurationInMinutes).toBe(1.84)
    expect(recordingBySiteHour[1].totalDurationInMinutes).toBe(0.34)
    expect(recordingBySiteHour[2].totalDurationInMinutes).toBe(1)
    expect(recordingBySiteHour[3].totalDurationInMinutes).toBe(1)
    expect(recordingBySiteHour[0].countsByMinute).toEqual([[0, 1], [10, 2]])
    expect(recordingBySiteHour[1].countsByMinute).toEqual([[20, 1]])
    expect(recordingBySiteHour[2].countsByMinute).toEqual([[20, 1]])
    expect(recordingBySiteHour[3].countsByMinute).toEqual([[10, 1]])
    expect(sum(recordingBySiteHour.map(item => item.count))).toBe(5)
  })

  // ------------ Write recordings by by site hour ----------

  test('can write grouped recordings to the bio db', async () => {
    // Arrange
    const NEW_RECORDS = [
      {
        siteIdArbimon: 88530,
        datetime: '2022-07-06 20:20:00',
        duration: 60,
        idArbimon: 1003,
        updatedAt: '2022-07-06 18:00:00'
      }
    ]

    // Act
    const recordingBySiteHour = await mapRecordingBySiteHourArbimonWithPrevSync(NEW_RECORDS, biodiversitySequelize)
    await writeRecordingBySiteHourToBio(recordingBySiteHour, biodiversitySequelize)
    const recordingBySiteHourBio = await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour.findAll()

    // Assert
    expect(recordingBySiteHourBio).toHaveLength(5)
    expect(dayjs(recordingBySiteHourBio[0].timePrecisionHourLocal)).toEqual(dayjs('2022-07-06T07:00:00.000Z'))
    expect(dayjs(recordingBySiteHourBio[1].timePrecisionHourLocal)).toEqual(dayjs('2022-07-07T19:00:00.000Z'))
    expect(dayjs(recordingBySiteHourBio[2].timePrecisionHourLocal)).toEqual(dayjs('2022-07-06T07:00:00.000Z'))
    expect(dayjs(recordingBySiteHourBio[3].timePrecisionHourLocal)).toEqual(dayjs('2022-07-08T19:00:00.000Z'))
    expect(dayjs(recordingBySiteHourBio[4].timePrecisionHourLocal)).toEqual(dayjs('2022-07-06T20:00:00.000Z'))
    expect(recordingBySiteHourBio[0].totalDurationInMinutes).toBe(1.84)
    expect(recordingBySiteHourBio[1].totalDurationInMinutes).toBe(0.34)
    expect(recordingBySiteHourBio[2].totalDurationInMinutes).toBe(1)
    expect(recordingBySiteHourBio[3].totalDurationInMinutes).toBe(1)
    expect(recordingBySiteHourBio[4].totalDurationInMinutes).toBe(1)
    expect(recordingBySiteHourBio[0].countsByMinute).toEqual([[0, 1], [10, 2]])
    expect(recordingBySiteHourBio[1].countsByMinute).toEqual([[20, 1]])
    expect(recordingBySiteHourBio[2].countsByMinute).toEqual([[20, 1]])
    expect(recordingBySiteHourBio[3].countsByMinute).toEqual([[10, 1]])
    expect(recordingBySiteHourBio[4].countsByMinute).toEqual([[20, 1]])
    expect(sum(recordingBySiteHourBio.map(item => item.count))).toBe(6)
  })
})
