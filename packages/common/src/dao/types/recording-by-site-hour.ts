import { attributes, AttributeTypes } from '../type-helpers'

export interface RecordingBySiteHour {
  timePrecisionHourLocal: Date
  locationProjectId: number
  locationSiteId: number
  count: number
  countsByMinute: number[][]
  totalDurationInMinutes: number
  createdAt?: Date
  updatedAt?: Date
}

export const ATTRIBUTES_RECORDING_BY_SITE_HOUR = attributes<RecordingBySiteHour>()({
})

export type RecordingBySiteHourTypes = AttributeTypes<RecordingBySiteHour, typeof ATTRIBUTES_RECORDING_BY_SITE_HOUR>
