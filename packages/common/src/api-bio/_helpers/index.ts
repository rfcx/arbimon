import { Site } from '../../domain'

export type ApiLine = Record<number, number>
export type ApiMap = Array<Pick<Site, 'name' | 'latitude' | 'longitude'> & { value: number }>
export type ApiStack = Array<[string, number]>
