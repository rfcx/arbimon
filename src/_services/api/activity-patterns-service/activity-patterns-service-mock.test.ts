import { DatasetDefinition, Site } from '~/api'
import { ActivityPatternsService } from '~/api/activity-patterns-service'
import { ApiDetection } from '~/api-helpers/mock'
import { dayjs } from '~/dayjs'

const MOCK_RECORDINGS_PER_HOUR = 12
const EXAMPLE_SITE: Site = { siteId: '123', name: '', longitude: 0, latitude: 0 }
const EXAMPLE_DATE = '2021-04-02T00:00:00.000Z'
const EXAMPLE_DATASET: DatasetDefinition = {
  start: EXAMPLE_DATE,
  end: dayjs(EXAMPLE_DATE).add(1, 'day').toString(),
  sites: [EXAMPLE_SITE]
}
const EXAMPLE_SPECIES_ID = 123

const EMPTY_DETECTION: ApiDetection = {
  arbimon_site_id: 0,
  stream_id: EXAMPLE_SITE.siteId,
  name: '',
  lat: 0,
  lon: 0,
  date: EXAMPLE_DATE,
  hour: 0,
  species_id: EXAMPLE_SPECIES_ID,
  scientific_name: '',
  taxon_id: 0,
  taxon: '',
  detection_frequency: 0
}

describe('AP Service Mock', () => {
  const detectionsToRecordingCount: Array<[number, ApiDetection[]]> = [
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
    [2 * MOCK_RECORDINGS_PER_HOUR, [
      { ...EMPTY_DETECTION, hour: 0, species_id: EXAMPLE_SPECIES_ID },
      { ...EMPTY_DETECTION, hour: 0, species_id: EXAMPLE_SPECIES_ID + 1 },
      { ...EMPTY_DETECTION, hour: 1, species_id: EXAMPLE_SPECIES_ID + 1 }
    ]]
  ]
  test.each(detectionsToRecordingCount)('calculate totalRecordingCount: %s', async (expected, detections) => {
    // Act
    const sut = new ActivityPatternsService(detections)
    const result = await sut.getActivityPatternsData(EXAMPLE_DATASET, EXAMPLE_SPECIES_ID)

    // Assert
    expect(result.totalRecordingCount).toEqual(expected)
  })
})
