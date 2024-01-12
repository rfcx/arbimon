import { type Project } from '@rfcx-bio/common/src/dao/types'

export const makeProject = (id: number, name: string): Project => {
  return {
    id,
    idCore: id.toString(),
    idArbimon: id,
    slug: name.toLowerCase().replace(' ', '-'),
    name,
    latitudeNorth: 0,
    latitudeSouth: 0,
    longitudeEast: 0,
    longitudeWest: 0
  }
}
