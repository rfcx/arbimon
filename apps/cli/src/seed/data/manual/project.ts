import { Project } from '@rfcx-bio/common/dao/types'

import { BioEnvironment } from '~/env/types'

const puertoRicoStaging: Omit<Project, 'id'> = {
  idCore: 'zy5jbxx4cs9f',
  idArbimon: 1556,
  slug: 'puerto-rico',
  name: 'Puerto Rico'
}

const bciStaging: Omit<Project, 'id'> = {
  idCore: 'bci392pan298',
  idArbimon: 1209,
  slug: 'bci-panama-2018',
  name: 'BCI-Panama_2018'
}

const fakeProjectStaging: Omit<Project, 'id'> = {
  idCore: 'rbj7k70v4na7',
  idArbimon: 1918,
  slug: 'fake-arbimon-project-for-bio',
  name: 'Fake Project'
}

const puertoRicoProduction: Omit<Project, 'id'> = {
  idCore: 'n9nrlg45vyf0',
  idArbimon: 1989,
  slug: 'puerto-rico-island-wide',
  name: 'Puerto Rico Island-Wide'
}

const bciProduction: Omit<Project, 'id'> = {
  idCore: 'xle0i1t9uea4',
  idArbimon: 1209,
  slug: 'bci-panama-2018',
  name: 'BCI-Panama_2018'
}

const madreProduction: Omit<Project, 'id'> = {
  idCore: 'kwsda03lllt4',
  idArbimon: 1429,
  slug: 'rfcx-guardians-madre-de-dios-peru',
  name: 'RFCx-Guardians in Madre de Dios Peru'
}

export const mockProjectsByEnv: Record<BioEnvironment, Array<Omit<Project, 'id'>>> = {
  local: [puertoRicoStaging, bciStaging, fakeProjectStaging],
  testing: [puertoRicoStaging, bciStaging, fakeProjectStaging],
  staging: [puertoRicoStaging, bciStaging],
  production: [puertoRicoProduction, bciProduction, madreProduction]
}
