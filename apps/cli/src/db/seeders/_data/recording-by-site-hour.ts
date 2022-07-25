// @ts-nocheck
// ignore because `recordedMinutes` is array and array symbol for sequelize is `{}`
import { RecordingBySiteHour } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

export const rawRecordingBySiteHour: Array<Omit<RecordingBySiteHour, 'createdAt' | 'updatedAt'>> = [
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00').toDate(),
    locationProjectId: 1,
    locationSiteId: 1, // CU26
    totalDurationInMinutes: 120.5,
    recordedMinutes: '{7, 9}'
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00').toDate(),
    locationProjectId: 1,
    locationSiteId: 11, // AR01
    totalDurationInMinutes: 120.5,
    recordedMinutes: '{7, 9}'
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 10:00:00').toDate(),
    locationProjectId: 1,
    locationSiteId: 2, // CU24
    totalDurationInMinutes: 60.25,
    recordedMinutes: '{11}'
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 12:00:00').toDate(),
    locationProjectId: 1,
    locationSiteId: 2, // CU24
    totalDurationInMinutes: 60.25,
    recordedMinutes: '{11}'
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 15:00:00').toDate(),
    locationProjectId: 1,
    locationSiteId: 2, // CU24
    totalDurationInMinutes: 180.75,
    recordedMinutes: '{11, 14, 17}'
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-15 23:00:00').toDate(),
    locationProjectId: 1,
    locationSiteId: 2, // CU24
    totalDurationInMinutes: 180.75,
    recordedMinutes: '{11, 14, 17}'
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-16 23:00:00').toDate(),
    locationProjectId: 1,
    locationSiteId: 2, // CU24
    totalDurationInMinutes: 60.25,
    recordedMinutes: '{11}'
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 00:00:00').toDate(),
    locationProjectId: 1,
    locationSiteId: 2, // CU24
    totalDurationInMinutes: 60.25,
    recordedMinutes: '{11}'
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 12:00:00').toDate(),
    locationProjectId: 1,
    locationSiteId: 2, // CU24
    totalDurationInMinutes: 60.25,
    recordedMinutes: '{11}'
  },
  {
    timePrecisionHourLocal: dayjs('2022-02-17 15:00:00').toDate(),
    locationProjectId: 1,
    locationSiteId: 3, // CU33
    totalDurationInMinutes: 180.75,
    recordedMinutes: '{11, 14, 17}'
  }
]
