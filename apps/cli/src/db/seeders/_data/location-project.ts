import { Project } from '@rfcx-bio/common/dao/types'

export const rawProjects: Record<string, Project[]> = {
  testing: [
    {
      id: 1,
      idCore: 'rbj7k70v4na7',
      slug: 'fake-arbimon-project-for-bio',
      slugArbimon: 'fake-arbimon-project-for-bio',
      isPublished: true,
      name: 'Fake Project',
      latitudeNorth: 18.51375,
      latitudeSouth: 17.93168,
      longitudeEast: -65.24505,
      longitudeWest: -67.94469784
    },
    {
      id: 2,
      idCore: '???',
      slug: 'bci-panama-2018',
      slugArbimon: 'bci-panama-2018',
      isPublished: true,
      name: 'BCI-Panama_2018',
      latitudeNorth: 0,
      latitudeSouth: 0,
      longitudeEast: 0,
      longitudeWest: 0
    }
  ],
  staging: [
    {
      id: 1,
      idCore: 'zy5jbxx4cs9f',
      slug: 'puerto-rico',
      slugArbimon: 'puerto-rico',
      isPublished: true,
      name: 'Puerto Rico',
      latitudeNorth: 18.51375,
      latitudeSouth: 17.93168,
      longitudeEast: -65.24505,
      longitudeWest: -67.94469784
    },
    {
      id: 2,
      idCore: 'bci392pan298',
      slug: 'bci-panama-2018',
      slugArbimon: 'bci-panama-2018',
      isPublished: true,
      name: 'BCI-Panama_2018',
      latitudeNorth: 0,
      latitudeSouth: 0,
      longitudeEast: 0,
      longitudeWest: 0
    }
  ],
  production: [
    {
      id: 1,
      idCore: 'n9nrlg45vyf0',
      slug: 'puerto-rico-island-wide',
      slugArbimon: 'puerto-rico-island-wide',
      isPublished: true,
      name: 'Puerto Rico Island-Wide',
      latitudeNorth: 18.51375,
      latitudeSouth: 17.93168,
      longitudeEast: -65.24505,
      longitudeWest: -67.94469784
    },
    {
      id: 2,
      idCore: 'xle0i1t9uea4',
      slug: 'bci-panama-2018',
      slugArbimon: 'bci-panama-2018',
      isPublished: true,
      name: 'BCI-Panama_2018',
      latitudeNorth: -79.81971,
      latitudeSouth: -79.86858,
      longitudeEast: 9.14041,
      longitudeWest: 9.17229
    },
    {
      id: 3,
      idCore: 'kwsda03lllt4',
      slug: 'rfcx-guardians-madre-de-dios-peru',
      slugArbimon: 'rfcx-guardians-madre-de-dios-peru',
      isPublished: true,
      name: 'RFCx-Guardians in Madre de Dios Peru',
      latitudeNorth: -70.25357092,
      latitudeSouth: -12.93793901,
      longitudeEast: 0,
      longitudeWest: 0
    }
  ]
}
