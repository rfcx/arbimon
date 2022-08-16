import { Site } from '@rfcx-bio/common/dao/types'

import { fakeProject } from './projects'

export const sites: Site[] = [
  {
    id: 201,
    idCore: 'MoLQA8aNulGb',
    idArbimon: 8412,
    locationProjectId: fakeProject.id,
    name: 'CU26',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: 202,
    idCore: 'uNhkJLYFMAvb',
    idArbimon: 8413,
    locationProjectId: fakeProject.id,
    name: 'CU24',
    latitude: 18.30692,
    longitude: -65.25233,
    altitude: 2.322431157
  },
  {
    id: 203,
    idCore: '9JthpAZPnsAs',
    idArbimon: 8414,
    locationProjectId: fakeProject.id,
    name: 'CU33',
    latitude: 18.31777,
    longitude: -65.28566,
    altitude: 55.51248239
  },
  {
    id: 204,
    idCore: 'wdrxF2bavjhw',
    idArbimon: 8425,
    locationProjectId: fakeProject.id,
    name: 'AR01',
    latitude: 18.48484,
    longitude: -66.5473,
    altitude: 6.163519308
  }
]
