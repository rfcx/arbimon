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
    }
  ]
}
