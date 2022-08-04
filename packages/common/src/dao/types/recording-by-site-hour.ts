import { attributes, AttributeTypes, WithDates } from '../type-helpers'

export interface RecordingBySiteHour extends WithDates {
  timePrecisionHourLocal: Date
  locationProjectId: number
  locationSiteId: number
  totalDurationInMinutes: number
  recordedMinutes: number[]
  recordingCount: number
}

export const ATTRIBUTES_RECORDING_BY_SITE_HOUR = attributes<RecordingBySiteHour>()({
})

export type RecordingBySiteHourTypes = AttributeTypes<RecordingBySiteHour, typeof ATTRIBUTES_RECORDING_BY_SITE_HOUR>
