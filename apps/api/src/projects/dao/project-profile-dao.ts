import dayjs from 'dayjs'

import type { ProjectInfoFieldType, ProjectInfoResponse, ProjectProfileUpdateBody, ProjectSettingsResponse } from '@rfcx-bio/common/api-bio/project/project-settings'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type LocationProjectProfile } from '@rfcx-bio/common/dao/types'

import { getProjectMetrics } from '@/dashboard/dashboard-metrics-dao'
import { getRichnessByTaxon } from '@/dashboard/dashboard-species-data-dao'
import { getImageUrl } from '@/users//helpers'
import { getSequelize } from '~/db'
import { getImageByObjectives } from '../utils/image-by-objective'

const profileDefaults: Omit<LocationProjectProfile, 'locationProjectId'> = {
  summary: '',
  readme: '',
  methods: '',
  keyResult: '',
  resources: '',
  image: '',
  objectives: [],
  dateStart: null,
  dateEnd: null
}

export const getProjectProfile = async (locationProjectId: number): Promise<LocationProjectProfile | undefined> => {
  return await ModelRepository.getInstance(getSequelize()).LocationProjectProfile.findByPk(locationProjectId) ?? undefined
}

export const createProjectProfile = async (partialProfile: Partial<LocationProjectProfile> & Pick<LocationProjectProfile, 'locationProjectId'>): Promise<void> => {
    const profile: LocationProjectProfile = {
      ...profileDefaults,
      ...partialProfile,
      image: getImageByObjectives(partialProfile.objectives)
    }
    await ModelRepository.getInstance(getSequelize()).LocationProjectProfile.create(profile)
}

export const updateProjectProfile = async (partialProfile: Partial<LocationProjectProfile> & Pick<LocationProjectProfile, 'locationProjectId'>): Promise<void> => {
  const sequelize = getSequelize()
  const { LocationProjectProfile } = ModelRepository.getInstance(sequelize)
  const { locationProjectId, ...fields } = partialProfile
  await LocationProjectProfile.update(fields, { where: { locationProjectId } })
}

/**
 * @deprecated Do not use ProjectInfo, needs refactoring
 */
export const getProjectInfo = async (locationProjectId: number, fields: ProjectInfoFieldType[]): Promise<ProjectInfoResponse> => {
  const sequelize = getSequelize()
  const { LocationProject, LocationProjectProfile, LocationProjectCountry, ProjectVersion } = ModelRepository.getInstance(sequelize)
  const resProject = await LocationProject.findOne({
    where: { id: locationProjectId },
    attributes: ['name'],
    raw: true
  })
  const resProfile = await LocationProjectProfile.findOne({
    where: { locationProjectId },
    attributes: ['summary', 'objectives', 'image', 'dateStart', 'dateEnd', 'readme', 'keyResult'],
    raw: true
  })

  const version = await ProjectVersion.findOne({
    where: { locationProjectId },
    attributes: ['isPublished', 'isPublic'],
    raw: true
  })

  let resCountry
  if (fields.includes('countryCodes')) {
    resCountry = await LocationProjectCountry.findOne({
      where: { locationProjectId },
      raw: true
    })
  }

  let metrics
  if (fields.includes('metrics')) {
    metrics = await getProjectMetrics(locationProjectId)
  }

  let richnessByTaxon
  if (fields.includes('richnessByTaxon')) {
    richnessByTaxon = await getRichnessByTaxon(locationProjectId)
  }

  if (!resProject) throw new Error(`Failed to get project settings for locationProjectId: ${locationProjectId}`)
  const baseProject = {
    name: resProject.name,
    summary: resProfile?.summary ?? '',
    objectives: resProfile?.objectives ?? [],
    dateStart: resProfile?.dateStart ?? null,
    dateEnd: resProfile?.dateEnd ?? null,
    isPublished: version?.isPublished ?? false,
    isPublic: version?.isPublic ?? false
  }

  return {
    ...baseProject,
    dateStart: baseProject.dateStart,
    ...(fields.includes('readme') ? { readme: resProfile?.readme ?? '' } : {}),
    ...(fields.includes('keyResult') ? { keyResults: resProfile?.keyResult ?? '' } : {}),
    ...(fields.includes('image') && resProfile?.image !== undefined ? { image: getImageUrl(resProfile.image) ?? '' } : {}),
    ...(fields.includes('countryCodes') ? { countryCodes: resCountry?.countryCodes ?? [] } : {}),
    ...(fields.includes('richnessByTaxon') ? { richnessByTaxon } : {}),
    ...(fields.includes('metrics')
        ? {
        metrics: {
          totalRecordings: metrics?.totalRecordings ?? 0,
          totalSpecies: metrics?.totalSpecies ?? 0,
          threatenedSpecies: metrics?.threatenedSpecies ?? 0,
          totalSites: metrics?.totalSites ?? 0,
          totalDetections: metrics?.totalDetections ?? 0
        }
        }
        : {}
    )
  }
}

/**
 * @deprecated Do not use ProjectSettings, needs refactoring
 */
export const getProjectSettings = async (locationProjectId: number): Promise<ProjectSettingsResponse> => {
  return await getProjectInfo(locationProjectId, ['name', 'summary', 'objectives', 'dateStart', 'dateEnd', 'countryCodes', 'isPublished'])
}

/**
 * @deprecated Do not use ProjectSettings, needs refactoring
 */
export const updateProjectSettings = async (locationProjectId: number, settings: ProjectProfileUpdateBody): Promise<ProjectSettingsResponse> => {
  const { name, isPublic, dateStart, dateEnd, ...fields } = settings
  if (name) {
    await ModelRepository.getInstance(getSequelize()).LocationProject.update({ name }, { where: { id: locationProjectId } })
  }
  const dateStartChanges = dateStart === undefined ? {} : { dateStart: dateStart ? dayjs(dateStart).toDate() : null }
  const dateEndChanges = dateEnd === undefined ? {} : { dateEnd: dateEnd ? dayjs(dateEnd).toDate() : null }
  await updateProjectProfile({ locationProjectId, ...fields, ...dateStartChanges, ...dateEndChanges })
  return await getProjectSettings(locationProjectId)
}
