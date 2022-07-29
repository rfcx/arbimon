import { DetectionBySiteSpeciesHour } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

export const rawDetectionBySiteSpeciesHour: Array<Omit<DetectionBySiteSpeciesHour, 'createdAt' | 'updatedAt'>> = [
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: 1,
    locationSiteId: 1, // CU26
    taxonClassId: 300,
    taxonSpeciesId: 1,
    count: 2,
    durationMinutes: 120,
    detectionMinutes: [7, 9]
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: 1,
    locationSiteId: 11, // AR01
    taxonClassId: 300,
    taxonSpeciesId: 2,
    count: 2,
    durationMinutes: 120,
    detectionMinutes: [7, 9]
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 12:00:00+00').toDate(),
    locationProjectId: 1,
    locationSiteId: 2, // CU24
    taxonClassId: 300,
    taxonSpeciesId: 2,
    count: 1,
    durationMinutes: 60,
    detectionMinutes: [55]
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 12:00:00+00').toDate(),
    locationProjectId: 1,
    locationSiteId: 2, // CU24
    taxonClassId: 300,
    taxonSpeciesId: 1,
    count: 1,
    durationMinutes: 60,
    detectionMinutes: [11]
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 13:00:00+00').toDate(),
    locationProjectId: 1,
    locationSiteId: 2, // CU24
    taxonClassId: 300,
    taxonSpeciesId: 1,
    count: 1,
    durationMinutes: 60,
    detectionMinutes: [1]
  }
]
