import { pickBy } from 'lodash-es'

import { type ProjectProfileResponse, type ProjectProfileUpdateBody } from '@rfcx-bio/common/api-bio/project-profile/project-profile'
import { type ProjectSettingsResponse, type ProjectSettingsUpdateBody } from '@rfcx-bio/common/api-bio/project-profile/project-settings'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const getProjectCoreId = async (locationProjectId: number): Promise<string | undefined> => {
  const project = await ModelRepository.getInstance(getSequelize())
  .LocationProject
  .findOne({
    where: { id: locationProjectId },
    attributes: ['idCore'],
    raw: true
  })
  return project?.idCore ?? undefined
}

export const updateProjectProfile = async (locationProjectId: number, profile: ProjectProfileUpdateBody): Promise<ProjectProfileResponse> => {
  // remove undefined values -- only update what is provided
  const updatedParams = pickBy({
    summary: profile.summary,
    objectives: profile.objectives,
    dateStart: profile.dateStart,
    dateEnd: profile.dateEnd
  }, (v) => v !== undefined)
  const locationProjectProfile = ModelRepository.getInstance(getSequelize()).LocationProjectProfile
  const res = await locationProjectProfile.update(updatedParams, { where: { locationProjectId }, returning: true })
  if (res[0] === 0) throw new Error(`Failed to update project profile for locationProjectId: ${locationProjectId}`)
  const updated = res[1][0].get({ plain: true })
  return updated
}

export const getProjectSettings = async (locationProjectId: number): Promise<ProjectSettingsResponse> => {
  const sequelize = getSequelize()
  const { LocationProject, LocationProjectProfile, LocationProjectCountry, ProjectVersion } = ModelRepository.getInstance(sequelize)
  const resProject = await LocationProject.findOne({
    where: { id: locationProjectId },
    attributes: ['name'],
    raw: true
  })
  const resProfile = await LocationProjectProfile.findOne({
    where: { locationProjectId },
    attributes: ['summary', 'objectives', 'dateStart', 'dateEnd'],
    raw: true
  })
  const resCountry = await LocationProjectCountry.findOne({
    where: { locationProjectId },
    raw: true
  })
  const version = await ProjectVersion.findOne({
    where: { locationProjectId },
    attributes: ['isPublished'],
    raw: true
  })
  if (!resProject) throw new Error(`Failed to get project settings for locationProjectId: ${locationProjectId}`)
  return {
    name: resProject.name,
    summary: resProfile?.summary ?? '',
    objectives: resProfile?.objectives ?? [],
    dateStart: resProfile?.dateStart ?? null,
    dateEnd: resProfile?.dateEnd ?? null,
    countryCodes: resCountry?.countryCodes ?? [],
    isPublished: version?.isPublished ?? false
  }
}

export const updateProjectSettings = async (locationProjectId: number, settings: ProjectSettingsUpdateBody): Promise<ProjectSettingsResponse> => {
  if (settings.name) {
    const locationProject = ModelRepository.getInstance(getSequelize()).LocationProject
    await locationProject.update({ name: settings.name }, { where: { id: locationProjectId } })
  }
  await updateProjectProfile(locationProjectId, settings)
  return await getProjectSettings(locationProjectId)
}
