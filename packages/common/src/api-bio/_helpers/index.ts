import { ProjectSite } from '../../dao/types'

export type ApiLine = Record<number, number>
export type ApiMap = Array<Pick<ProjectSite, 'name' | 'latitude' | 'longitude'> & { value: number }>
export type ApiStack = Array<[number, number]>
