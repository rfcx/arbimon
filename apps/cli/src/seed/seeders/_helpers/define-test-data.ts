import { Project, ProjectSite } from '@rfcx-bio/common/dao/types'
import { urlify } from '@rfcx-bio/utils/url-helpers'

import { SiteAutoProject } from './create-project-with-detections'

export const defineTestProject = (scenarioId: number, name: string, index: number = 0): Project => {
  const id = getId(scenarioId, index)
  const nameFull = `${id} ${name}`

  return {
    id,
    idCore: getIdCore(id),
    idArbimon: getIdArbimon(id),
    slug: urlify(nameFull),
    name: nameFull
  }
}

export const defineTestSite = (scenarioId: number, name: string, index: number = 0, optionalProps?: Partial<SiteDefaults>): SiteAutoProject => {
  const id = getId(scenarioId, index)

  return {
    ...SITE_DEFAULTS,
    ...optionalProps,
    id,
    idCore: getIdCore(id),
    idArbimon: getIdArbimon(id),
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

/**
 * @example
 * id: 10001001 // 10001-001
 * idArbimon: 110001001 // 1-10001-001
 */
const OBJECT_ID_LENGTH = 3 // ex: 001
const SCENARIO_ID_LENGTH = 5 // ex: 10001

const SCENARIO_ID_MAGNITUDE = Math.pow(10, OBJECT_ID_LENGTH)
const getId = (scenarioId: number, index: number): number => scenarioId * SCENARIO_ID_MAGNITUDE + index

const ID_CORE_MAGNITUDE = 12
const getIdCore = (id: number): string => 'c' + id.toString().slice(0, ID_CORE_MAGNITUDE - 1).padStart(ID_CORE_MAGNITUDE - 1, '0')

const ID_ARBIMON_MAGNITUDE = Math.pow(10, SCENARIO_ID_LENGTH + OBJECT_ID_LENGTH)
const getIdArbimon = (id: number): number => ID_ARBIMON_MAGNITUDE + id
