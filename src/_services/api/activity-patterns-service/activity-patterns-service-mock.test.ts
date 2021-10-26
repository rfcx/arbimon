import { DatasetDefinition, Site } from '~/api'
import { ActivityPatternsService } from '~/api/activity-patterns-service'
import { ApiDetection } from '~/api-helpers/mock'
import { dayjs } from '~/dayjs'

const MOCK_RECORDINGS_PER_HOUR = 12

const EXAMPLE_SITE_IDS = ['123', '456', '789']
const EXAMPLE_SITES: Site[] = EXAMPLE_SITE_IDS.map(siteId => ({ siteId, name: '', longitude: 0, latitude: 0 }))
const EXAMPLE_DATE = '2021-04-02T00:00:00.000Z'

const EXAMPLE_SPECIES_IDS = [123, 456, 789]
const EXAMPLE_SPECIES_ID_NOT_INTERESTED = EXAMPLE_SPECIES_IDS[0]
const EXAMPLE_SPECIES_ID_NOT_INTERESTED2 = EXAMPLE_SPECIES_IDS[1]
const EXAMPLE_SPECIES_ID_INTERESTED = EXAMPLE_SPECIES_IDS[3]

const EXAMPLE_DATASET: DatasetDefinition = {
  start: EXAMPLE_DATE,
  end: dayjs(EXAMPLE_DATE).add(1, 'day').toString(),
  sites: EXAMPLE_SITES
}

const EMPTY_DETECTION: ApiDetection = {
  arbimon_site_id: 0,
  stream_id: EXAMPLE_SITES[0].siteId,
  name: '',
  lat: 0,
  lon: 0,
  date: EXAMPLE_DATE,
  hour: 0,
  species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED,
  scientific_name: '',
  taxon_id: 0,
  taxon: '',
  num_of_recordings: 1,
  detection_frequency: 1 / 12
}

describe('AP Service Mock', () => {
  const totalDetectionsToRecordingCount: Array<[number, ApiDetection[]]> = [
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
      { ...EMPTY_DETECTION, hour: 0, species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED },
      { ...EMPTY_DETECTION, hour: 1, species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED },
      { ...EMPTY_DETECTION, hour: 2, species_id: EXAMPLE_SPECIES_ID_INTERESTED }
    ]]
  ]
  test.each(totalDetectionsToRecordingCount)('calculate totalRecordingCount: %s', async (expected, detections) => {
    // Act
    const sut = new ActivityPatternsService(detections, 0)
    const result = await sut.getActivityPatternsData(EXAMPLE_DATASET, EXAMPLE_SPECIES_ID_INTERESTED)

    // Assert
    expect(result.totalRecordingCount).toEqual(expected)
  })

  const totalDetectionsToSiteCount: Array<[number, ApiDetection[]]> = [
    [1, [
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITES[0].siteId },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITES[0].siteId },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITES[0].siteId }
    ]],
    [3, [
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITES[0].siteId },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITES[1].siteId },
      { ...EMPTY_DETECTION, stream_id: EXAMPLE_SITES[2].siteId }
    ]]
  ]
  test.each(totalDetectionsToSiteCount)('calculate totalSiteCount: %s', async (expected, detections) => {
    // Act
    const sut = new ActivityPatternsService(detections, 0)
    const result = await sut.getActivityPatternsData(EXAMPLE_DATASET, EXAMPLE_SPECIES_ID_INTERESTED)

    // Assert
    expect(result.totalSiteCount).toEqual(expected)
  })

  const totalDetectionsToDetectionCount: Array<[number, ApiDetection[]]> = [
    [3, [
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 0, num_of_recordings: 1 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 1, num_of_recordings: 2 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED, hour: 1, num_of_recordings: 2 }
    ]],
    [10, [
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 0, num_of_recordings: 1 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 1, num_of_recordings: 2 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 2, num_of_recordings: 3 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 3, num_of_recordings: 4 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED, hour: 0, num_of_recordings: 1 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED, hour: 1, num_of_recordings: 2 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED, hour: 2, num_of_recordings: 3 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED2, hour: 0, num_of_recordings: 4 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED2, hour: 1, num_of_recordings: 5 }
    ]]
  ]
  test.each(totalDetectionsToDetectionCount)('calculate detectionCount: %s', async (expected, detections) => {
    // Act
    const sut = new ActivityPatternsService(detections, 0)
    const result = await sut.getActivityPatternsData(EXAMPLE_DATASET, EXAMPLE_SPECIES_ID_INTERESTED)

    // Assert
    expect(result.detectionCount).toEqual(expected)
  })

  const totalDetectionsToDetectionFrequency: Array<[number, ApiDetection[]]> = [
    [3 / (2 * MOCK_RECORDINGS_PER_HOUR), [
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 0, num_of_recordings: 1 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 1, num_of_recordings: 2 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED, hour: 1, num_of_recordings: 2 }
    ]],
    [10 / (4 * MOCK_RECORDINGS_PER_HOUR), [
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 0, num_of_recordings: 1 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 1, num_of_recordings: 2 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 2, num_of_recordings: 3 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_INTERESTED, hour: 3, num_of_recordings: 4 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED, hour: 0, num_of_recordings: 1 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED, hour: 1, num_of_recordings: 2 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED, hour: 2, num_of_recordings: 3 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED2, hour: 0, num_of_recordings: 4 },
      { ...EMPTY_DETECTION, species_id: EXAMPLE_SPECIES_ID_NOT_INTERESTED2, hour: 1, num_of_recordings: 5 }
    ]]
  ]
  test.each(totalDetectionsToDetectionFrequency)('calculate detectionFrequency: %s', async (expected, detections) => {
    // Act
    const sut = new ActivityPatternsService(detections, 0)
    const result = await sut.getActivityPatternsData(EXAMPLE_DATASET, EXAMPLE_SPECIES_ID_INTERESTED)

    // Assert
    expect(result.detectionFrequency).toEqual(expected)
  })
})
