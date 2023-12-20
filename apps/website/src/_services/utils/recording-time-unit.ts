export interface RecordingTime {
  unit: string
  value: number
}

const totalRecordingsUnit = (totalRecordingsMin: number, minHour: number): string => totalRecordingsMin < minHour * 60 ? 'minutes' : 'hours'
const totalRecordingsValue = (totalRecordingsMin: number, minHour: number): number => {
  return totalRecordingsMin < minHour * 60 ? totalRecordingsMin : totalRecordingsMin / 60
}

export const totalRecordingsInHours = (totalRecordingsMin: number, minHour: number): RecordingTime => {
  return {
    unit: totalRecordingsUnit(totalRecordingsMin, minHour),
    value: totalRecordingsValue(totalRecordingsMin, minHour)
  }
}
