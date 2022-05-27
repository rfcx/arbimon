import { Project, ProjectSite } from '@rfcx-bio/common/dao/types'
import { urlify } from '@rfcx-bio/utils/url-helpers'

import { SiteAutoProject } from './create-project-with-detections'

export const defineTestProject = (scenarioId: number, name: string, index: number = 0): Project => {
  const id = scenarioId * 1000 + index
  const nameFull = `${id} ${name}`

  return {
    id,
    idCore: id.toString().slice(0, 12).padStart(12, '0'),
    idArbimon: id,
    slug: urlify(nameFull),
    name: nameFull
  }
}

export const defineTestSite = (scenarioId: number, name: string, index: number = 0, optionalProps?: Partial<SiteDefaults>): SiteAutoProject => {
  const id = scenarioId * 1000 + index

  return {
    ...SITE_DEFAULTS,
    ...optionalProps,
    id,
    idCore: id.toString().slice(0, 12).padStart(12, '0'),
    idArbimon: id,
    name: `${id} ${name}`
  }
}

export const defineTestSites = (scenarioId: number, name: string) => (_key: number, idx: number) => defineTestSite(scenarioId, name, idx)

type SiteDefaults = Pick<ProjectSite, 'latitude' | 'longitude' | 'altitude'>

const SITE_DEFAULTS: SiteDefaults = {
  latitude: 18.31307,
  longitude: -65.24878,
  altitude: 30.85246588
}
