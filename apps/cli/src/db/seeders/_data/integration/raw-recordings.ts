import type { RecordingBySiteHour } from '@rfcx-bio/node-common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { sites } from './project-sites'
import { fakeProject } from './projects'

export const rawRecordingBySiteHour: Array<Omit<RecordingBySiteHour, 'createdAt' | 'updatedAt'>> = [
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: fakeProject.id,
    locationSiteId: sites[0].id, // CU26
    totalDurationInMinutes: 120.5,
    countsByMinute: [[7, 1], [9, 1]],
    count: 2
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: fakeProject.id,
    locationSiteId: sites[3].id, // AR01
    totalDurationInMinutes: 120.5,
    countsByMinute: [[7, 1], [9, 1]],
    count: 2
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00+00').toDate(),
    locationProjectId: fakeProject.id,
    locationSiteId: sites[1].id, // CU24
    totalDurationInMinutes: 60.25,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 12:00:00+00').toDate(),
    locationProjectId: fakeProject.id,
    locationSiteId: sites[1].id, // CU24
    totalDurationInMinutes: 60.25,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 15:00:00+00').toDate(),
    locationProjectId: fakeProject.id,
    locationSiteId: sites[1].id, // CU24
    totalDurationInMinutes: 180.75,
    countsByMinute: [[11, 1], [14, 1], [17, 1]],
    count: 3
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 23:00:00+00').toDate(),
    locationProjectId: fakeProject.id,
    locationSiteId: sites[1].id, // CU24
    totalDurationInMinutes: 180.75,
    countsByMinute: [[11, 1], [14, 1], [17, 1]],
    count: 3
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-16 23:00:00+00').toDate(),
    locationProjectId: fakeProject.id,
    locationSiteId: sites[1].id, // CU24
    totalDurationInMinutes: 60.25,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 00:00:00+00').toDate(),
    locationProjectId: fakeProject.id,
    locationSiteId: sites[1].id, // CU24
    totalDurationInMinutes: 60.25,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 12:00:00+00').toDate(),
    locationProjectId: fakeProject.id,
    locationSiteId: sites[1].id, // CU24
    totalDurationInMinutes: 60.25,
    countsByMinute: [[11, 1]],
    count: 1
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 15:00:00+00').toDate(),
    locationProjectId: fakeProject.id,
    locationSiteId: sites[2].id, // CU33
    totalDurationInMinutes: 180.75,
    countsByMinute: [[11, 1], [14, 1], [17, 1]],
    count: 3
  }
]
