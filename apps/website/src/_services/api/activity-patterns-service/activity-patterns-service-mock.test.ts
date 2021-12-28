import { describe, expect, test } from 'vitest'

import { Site } from '@rfcx-bio/common/api-bio/common/sites'
import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { ActivityPatternsService } from '~/api/activity-patterns-service'
import { DatasetParameters } from '~/filters'

const MOCK_RECORDINGS_PER_HOUR = 12

const EXAMPLE_DATE = dayjs('2021-04-02T00:00:00.000Z')
const EXAMPLE_SITE_IDS_INTERESTED = ['100', '200', '300', '400', '500', '600', '700', '800', '900']
const EXAMPLE_SITES_INTERESTED: Site[] = EXAMPLE_SITE_IDS_INTERESTED.map(siteId => ({ siteId, name: '', longitude: 0, latitude: 0, altitude: 0 }))
const EXAMPLE_SITE_IDS_UNINTERESTED = ['111', '222', '333', '444', '555', '666', '777', '888', '999']
const EXAMPLE_SPECIES_ID_INTERESTED = 555
const EXAMPLE_SPECIES_IDS_UNINTERESTED = [100, 200, 300, 400, 500, 600, 700, 800, 900]

const EXAMPLE_DATASET_DEFINITION: DatasetParameters = {
  startDate: EXAMPLE_DATE,
  endDate: EXAMPLE_DATE,
  sites: EXAMPLE_SITES_INTERESTED,
  otherFilters: []
}

const EMPTY_DETECTION: MockHourlyDetectionSummary = {
  arbimon_site_id: 0,
  stream_id: EXAMPLE_SITES_INTERESTED[0].siteId,
  name: '',
  lat: 0,
  lon: 0,
  alt: 123,
  date: EXAMPLE_DATE.toISOString(),
  hour: 0,
  species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0],
  scientific_name: '',
  taxon_id: 0,
  taxon: '',
  num_of_recordings: 1,
  detection_frequency: 1 / 12
}

describe('AP Service Mock', () => {
  const recordingCountAndSummaries: Array<[number, MockHourlyDetectionSummary[]]> = [
    [MOCK_RECORDINGS_PER_HOUR, [
      { ...EMPTY_DETECTION, hour: 0 },
      { ...EMPTY_DETECTION, hour: 0 },
      { ...EMPTY_DETECTION, hour: 0 }
    ]],
    [2 * MOCK_RECORDINGS_PER_HOUR, [
      { ...EMPTY_DETECTION, hour: 0 },
      { ...EMPTY_DETECTION, hour: 0 },
      { ...EMPTY_DETECTION, hour: 1 }
    ]],
    [3 * MOCK_RECORDINGS_PER_HOUR, [
      { ...EMPTY_DETECTION, hour: 0, species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, hour: 0, species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, hour: 1, species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, hour: 2, species_id: EXAMPLE_SPECIES_ID_INTERESTED }
    ]]
  ]

  test('calculate totalRecordingCount', async () => {
    await Promise.all(recordingCountAndSummaries.map(async ([expected, summaries]) => {
      // Act
      const sut = new ActivityPatternsService(summaries, 0)
      const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

      // Assert
      expect(result.totalRecordingCount).toEqual(expected)
    }))
  })

  const totalDetectionsToSiteCount: Array<[number, MockHourlyDetectionSummary[]]> = [
    [1, [
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITES_INTERESTED[0].siteId },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITES_INTERESTED[0].siteId },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITES_INTERESTED[0].siteId }
    ]],
    [3, [
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITES_INTERESTED[0].siteId },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITES_INTERESTED[1].siteId },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITES_INTERESTED[2].siteId }
    ]],
    [7, [
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[0], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[2], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[4], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[6], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[1], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[2], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[3], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[4], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[5], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[6], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1] }
    ]],
    [4, [
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[4], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[6], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[1], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[2], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[6], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_UNINTERESTED[0], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_UNINTERESTED[2], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_UNINTERESTED[3], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_UNINTERESTED[4], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_UNINTERESTED[5], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1] }
    ]]
  ]
  test('calculate totalSiteCount', async () => {
    await Promise.all(totalDetectionsToSiteCount.map(async ([expected, detections]) => {
      // Act
      const sut = new ActivityPatternsService(detections, 0)
      const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

      // Assert
      expect(result.totalSiteCount).toEqual(expected)
    }))
  })

  const totalDetectionsToDetectionCount: Array<[number, MockHourlyDetectionSummary[]]> = [
    [3, [
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 0, num_of_recordings: 1 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 1, num_of_recordings: 2 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0], hour: 1, num_of_recordings: 2 }
    ]],
    [10, [
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 0, num_of_recordings: 1 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 1, num_of_recordings: 2 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 2, num_of_recordings: 3 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 3, num_of_recordings: 4 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0], hour: 0, num_of_recordings: 1 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0], hour: 1, num_of_recordings: 2 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0], hour: 2, num_of_recordings: 3 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1], hour: 0, num_of_recordings: 4 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1], hour: 1, num_of_recordings: 5 }
    ]]
  ]
  test('calculate detectionCount', async () => {
    await Promise.all(totalDetectionsToDetectionCount.map(async ([expected, detections]) => {
      // Act
      const sut = new ActivityPatternsService(detections, 0)
      const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

      // Assert
      expect(result.detectionCount).toEqual(expected)
    }))
  })

  const totalDetectionsToDetectionFrequency: Array<[number, MockHourlyDetectionSummary[]]> = [
    [3 / (2 * MOCK_RECORDINGS_PER_HOUR), [
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 0, num_of_recordings: 1 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 1, num_of_recordings: 2 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0], hour: 1, num_of_recordings: 2 }
    ]],
    [10 / (4 * MOCK_RECORDINGS_PER_HOUR), [
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 0, num_of_recordings: 1 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 1, num_of_recordings: 2 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 2, num_of_recordings: 3 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 3, num_of_recordings: 4 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0], hour: 0, num_of_recordings: 1 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0], hour: 1, num_of_recordings: 2 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0], hour: 2, num_of_recordings: 3 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1], hour: 0, num_of_recordings: 4 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1], hour: 1, num_of_recordings: 5 }
    ]]
  ]
  test('calculate detectionFrequency', async () => {
    await Promise.all(totalDetectionsToDetectionFrequency.map(async ([expected, detections]) => {
      // Act
      const sut = new ActivityPatternsService(detections, 0)
      const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

      // Assert
      expect(result.detectionFrequency).toEqual(expected)
    }))
  })

  const totalDetectionsToOccupiedSiteCount: Array<[number, MockHourlyDetectionSummary[]]> = [
    [2, [
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[0], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[1], species_id: EXAMPLE_SPECIES_ID_INTERESTED }
    ]],
    [4, [
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[0], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[2], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[4], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[6], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[1], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[2], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[3], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[4], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[5], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[6], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1] }
    ]]
  ]
  test('calculate occupiedSiteCount', async () => {
    await Promise.all(totalDetectionsToOccupiedSiteCount.map(async ([expected, detections]) => {
      // Act
      const sut = new ActivityPatternsService(detections, 0)
      const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

      // Assert
      expect(result.occupiedSiteCount).toEqual(expected)
    }))
  })

  const totalDetectionsToOccupiedSiteFrequency: Array<[number, MockHourlyDetectionSummary[]]> = [
    [1 / 1, [
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[0], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[1], species_id: EXAMPLE_SPECIES_ID_INTERESTED }
    ]],
    [0, [
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[0], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[1], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1] }
    ]],
    [4 / 7, [
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[0], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[2], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[4], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[6], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[1], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[2], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[3], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[4], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[5], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1] },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[6], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[1] }
    ]]
  ]
  test('calculate occupiedSiteFrequency', async () => {
    await Promise.all(totalDetectionsToOccupiedSiteFrequency.map(async ([expected, detections]) => {
      // Act
      const sut = new ActivityPatternsService(detections, 0)
      const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

      // Assert
      expect(result.occupiedSiteFrequency).toEqual(expected)
    }))
  })

  const sitesOccupiedAndSummaries: Array<[{ [siteId: string]: boolean }, MockHourlyDetectionSummary[]]> = [
    [
      { [EXAMPLE_SITE_IDS_INTERESTED[0]]: true, [EXAMPLE_SITE_IDS_INTERESTED[1]]: false },
      [
        { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[0], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
        { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[1], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] }
      ]
    ]
  ]
  test('calculate siteOccupied', async () => {
    await Promise.all(sitesOccupiedAndSummaries.map(async ([expected, detections]) => {
      // Act
      const sut = new ActivityPatternsService(detections, 0)
      const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

      // Assert
      Object.entries(result.activityBySite)
        .forEach(([siteId, data]) => expect(data.siteOccupied).toEqual(expected[siteId]))
    }))
  })

  const siteDetectionCountAndSummaries: Array<[{ [siteId: string]: number }, MockHourlyDetectionSummary[]]> = [
    [
      { [EXAMPLE_SITE_IDS_INTERESTED[0]]: 0, [EXAMPLE_SITE_IDS_INTERESTED[1]]: 1, [EXAMPLE_SITE_IDS_INTERESTED[2]]: 2 },
      [
        { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[0], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
        { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[1], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
        { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[2], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
        { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[2], species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 1 }
      ]
    ]
  ]
  test('calculate siteDetectionCount', async () => {
    await Promise.all(siteDetectionCountAndSummaries.map(async ([expected, detections]) => {
      // Act
      const sut = new ActivityPatternsService(detections, 0)
      const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

      // Assert
      Object.entries(result.activityBySite)
        .forEach(([siteId, data]) => expect(data.siteDetectionCount).toEqual(expected[siteId]))
    }))
  })

  const siteDetectionFrequencyAndSummaries: Array<[{ [siteId: string]: number }, MockHourlyDetectionSummary[]]> = [
    [
      { [EXAMPLE_SITE_IDS_INTERESTED[0]]: 0, [EXAMPLE_SITE_IDS_INTERESTED[1]]: 1 / 12, [EXAMPLE_SITE_IDS_INTERESTED[2]]: 18 / (12 * 2) },
      [
        { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[0], species_id: EXAMPLE_SPECIES_IDS_UNINTERESTED[0] },
        { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[1], species_id: EXAMPLE_SPECIES_ID_INTERESTED },
        { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[2], species_id: EXAMPLE_SPECIES_ID_INTERESTED, num_of_recordings: 6 },
        { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITE_IDS_INTERESTED[2], species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 1, num_of_recordings: 12 }
      ]
    ]
  ]
  test('calculate siteDetectionFrequency', async () => {
    await Promise.all(siteDetectionFrequencyAndSummaries.map(async ([expected, detections]) => {
      // Act
      const sut = new ActivityPatternsService(detections, 0)
      const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

      // Assert
      Object.entries(result.activityBySite)
        .forEach(([siteId, data]) => expect(data.siteDetectionFrequency).toEqual(expected[siteId]))
    }))
  })
})
