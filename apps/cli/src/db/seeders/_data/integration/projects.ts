import { type Project } from '@rfcx-bio/common/dao/types'

export const fakeProject: Project = {
  id: 201,
  idCore: '8dcib372gh',
  idArbimon: 1920,
  slug: 'dci-fake',
  name: 'DCI Fake Project',
  status: 'listed',
  statusUpdatedAt: new Date(),
  latitudeNorth: 0,
  latitudeSouth: 0,
  longitudeEast: 0,
  longitudeWest: 0
}

export const projects = [fakeProject]
