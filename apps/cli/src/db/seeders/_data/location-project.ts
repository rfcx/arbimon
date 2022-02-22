import { Project } from '@rfcx-bio/common/dao/types'

export const rawProjects: Record<string, Project[]> = {
  testing: [
    {
      id: 1,
      idCore: 'rbj7k70v4na7',
      idArbimon: 1918,
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
      idCore: 'bci392pan298',
      idArbimon: 1209,
      slug: 'bci-panama-2018',
      slugArbimon: 'bci-panama-2018',
      isPublished: true,
      name: 'BCI-Panama_2018',
      latitudeNorth: 9.17229,
      latitudeSouth: 9.14041,
      longitudeEast: -79.81971,
      longitudeWest: -79.86858
    }
  ],
  staging: [
    {
      id: 1,
      idCore: 'zy5jbxx4cs9f',
      idArbimon: 1556,
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
      idArbimon: 1209,
      slug: 'bci-panama-2018',
      slugArbimon: 'bci-panama-2018',
      isPublished: true,
      name: 'BCI-Panama_2018',
      latitudeNorth: 9.17229,
      latitudeSouth: 9.14041,
      longitudeEast: -79.81971,
      longitudeWest: -79.86858
    }
  ],
  production: [
    {
      id: 1,
      idCore: 'n9nrlg45vyf0',
      idArbimon: 1989,
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
      idArbimon: 1209,
      slug: 'bci-panama-2018',
      slugArbimon: 'bci-panama-2018',
      isPublished: true,
      name: 'BCI-Panama_2018',
      latitudeNorth: 9.17229,
      latitudeSouth: 9.14041,
      longitudeEast: -79.81971,
      longitudeWest: -79.86858
    },
    {
      id: 3,
      idCore: 'kwsda03lllt4',
      idArbimon: 1429,
      slug: 'rfcx-guardians-madre-de-dios-peru',
      slugArbimon: 'rfcx-guardians-madre-de-dios-peru',
      isPublished: true,
      name: 'RFCx-Guardians in Madre de Dios Peru',
      latitudeNorth: -12.560,
      latitudeSouth: -12.93793901,
      longitudeEast: -69.337,
      longitudeWest: -70.25357092
    }
  ]
}
