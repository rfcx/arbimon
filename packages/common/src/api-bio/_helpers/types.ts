import { type Site } from '../../dao/types'

export type ApiLine = Record<number, number>
export type ApiMap = Array<Pick<Site, 'name'> & { latitude: number, longitude: number, value: number, taxonClassId?: number }>
export type ApiStack = Array<[number, number]>

export type TimeBucket = 'hourOfDay' | 'dayOfWeek' | 'monthOfYear' | 'date'
export type DataByTime<T=unknown> = Record<TimeBucket, T>
