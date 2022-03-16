export type TimeBucket = 'hourOfDay' | 'dayOfWeek' | 'monthOfYear' | 'dateSeries'

export type DataByTime<T=unknown> = Record<TimeBucket, T>
