import { Site } from '../../dao/types'

export type ApiLine = Record<number, number>
export type ApiMap = Array<Pick<Site, 'name' | 'latitude' | 'longitude'> & { value: number }>
export type ApiStack = Array<[string, number]>
