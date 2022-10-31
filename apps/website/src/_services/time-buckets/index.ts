import { mapValues } from 'lodash-es'

export type TimeBucket = 'hourOfDay' | 'dayOfWeek' | 'monthOfYear' | 'date'

export const TIME_BUCKET_LABELS: Record<TimeBucket, string> = {
  hourOfDay: 'hour of day',
  dayOfWeek: 'day of week',
  monthOfYear: 'month of year',
  date: 'date'
}

export const TIME_BUCKET_BOUNDS: Partial<Record<TimeBucket, [number, number]>> = {
  hourOfDay: [0, 23],
  dayOfWeek: [0, 6],
  monthOfYear: [0, 11]
}

export const TIME_LABELS: Partial<Record<TimeBucket, string[]>> = {
  dayOfWeek: ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'],
  monthOfYear: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
}

export const TIME_LABEL_FORMATTERS: Partial<Record<TimeBucket, (val: number) => string>> =
  mapValues(TIME_LABELS, labels => (n: number) => (labels as string[])[n])
