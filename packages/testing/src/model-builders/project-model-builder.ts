import { type Project, type ProjectStatus } from '@rfcx-bio/common/src/dao/types'

export const makeProject = (id: number, name: string, status: ProjectStatus = 'published'): Project => {
  return {
    id,
    idCore: id.toString(),
    idArbimon: id,
    slug: name.toLowerCase().replace(' ', '-'),
    name,
    status,
    statusUpdatedAt: new Date(),
    latitudeNorth: 0,
    latitudeSouth: 0,
    longitudeEast: 0,
    longitudeWest: 0
  }
}