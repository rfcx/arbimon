import { Site } from '@rfcx-bio/common/api-bio-types/sites'
import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { ActivityPatternsService } from '~/api/activity-patterns-service'
import { DatasetParameters } from '~/filters'

jest.useFakeTimers()

const MOCK_RECORDINGS_PER_HOUR = 12

const EXAMPLE_DATE = '2021-04-02T00:00:00.000Z'
const EXAMPLE_SITE_IDS_INTERESTED = ['100', '200', '300', '400', '500', '600', '700', '800', '900']
const EXAMPLE_SITES_INTERESTED: Site[] = EXAMPLE_SITE_IDS_INTERESTED.map(siteId => ({ siteId, name: '', longitude: 0, latitude: 0, altitude: 0 }))
const EXAMPLE_SITE_IDS_UNINTERESTED = ['111', '222', '333', '444', '555', '666', '777', '888', '999']
const EXAMPLE_SPECIES_ID_INTERESTED = 555
const EXAMPLE_SPECIES_IDS_UNINTERESTED = [100, 200, 300, 400, 500, 600, 700, 800, 900]

const EXAMPLE_DATASET_DEFINITION: DatasetParameters = {
  start: EXAMPLE_DATE,
  end: dayjs(EXAMPLE_DATE).add(1, 'day').toString(),
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
  date: EXAMPLE_DATE,
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
  test.each(recordingCountAndSummaries)('calculate totalRecordingCount: %s', async (expected, summaries) => {
    // Act
    const sut = new ActivityPatternsService(summaries, 0)
    const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

    // Assert
    expect(result.totalRecordingCount).toEqual(expected)
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
  test.each(totalDetectionsToSiteCount)('calculate totalSiteCount: %s', async (expected, detections) => {
    // Act
    const sut = new ActivityPatternsService(detections, 0)
    const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

    // Assert
    expect(result.totalSiteCount).toEqual(expected)
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
  test.each(totalDetectionsToDetectionCount)('calculate detectionCount: %s', async (expected, detections) => {
    // Act
    const sut = new ActivityPatternsService(detections, 0)
    const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

    // Assert
    expect(result.detectionCount).toEqual(expected)
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
  test.each(totalDetectionsToDetectionFrequency)('calculate detectionFrequency: %s', async (expected, detections) => {
    // Act
    const sut = new ActivityPatternsService(detections, 0)
    const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

    // Assert
    expect(result.detectionFrequency).toEqual(expected)
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
  test.each(totalDetectionsToOccupiedSiteCount)('calculate occupiedSiteCount: %s', async (expected, detections) => {
    // Act
    const sut = new ActivityPatternsService(detections, 0)
    const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

    // Assert
    expect(result.occupiedSiteCount).toEqual(expected)
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
  test.each(totalDetectionsToOccupiedSiteFrequency)('calculate occupiedSiteFrequency: %s', async (expected, detections) => {
    // Act
    const sut = new ActivityPatternsService(detections, 0)
    const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

    // Assert
    expect(result.occupiedSiteFrequency).toEqual(expected)
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
  test.each(sitesOccupiedAndSummaries)('calculate siteOccupied: %s', async (expected, detections) => {
    // Act
    const sut = new ActivityPatternsService(detections, 0)
    const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

    // Assert
    Object.entries(result.activityBySite)
      .forEach(([siteId, data]) => expect(data.siteOccupied).toEqual(expected[siteId]))
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
  test.each(siteDetectionCountAndSummaries)('calculate siteDetectionCount: %s', async (expected, detections) => {
    // Act
    const sut = new ActivityPatternsService(detections, 0)
    const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

    // Assert
    Object.entries(result.activityBySite)
      .forEach(([siteId, data]) => expect(data.siteDetectionCount).toEqual(expected[siteId]))
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
  test.each(siteDetectionFrequencyAndSummaries)('calculate siteDetectionFrequency: %s', async (expected, detections) => {
    // Act
    const sut = new ActivityPatternsService(detections, 0)
    const result = await sut.getActivityPatternsData(EXAMPLE_DATASET_DEFINITION, EXAMPLE_SPECIES_ID_INTERESTED)

    // Assert
    Object.entries(result.activityBySite)
      .forEach(([siteId, data]) => expect(data.siteDetectionFrequency).toEqual(expected[siteId]))
  })
})
