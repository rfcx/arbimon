import { Site } from '../../dao/types-table'

export type ApiLine = Record<number, number>
export type ApiMap = Array<Pick<Site, 'name' | 'latitude' | 'longitude'> & { value: number }>
export type ApiStack = Array<[number, number]>
