export type TimeBucket = 'hourOfDay' | 'dayOfWeek' | 'monthOfYear'

export const TIME_BUCKET_LABELS: Record<TimeBucket, string> = {
  hourOfDay: 'Hour of day',
  dayOfWeek: 'Day of week',
  monthOfYear: 'Month of year'
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
