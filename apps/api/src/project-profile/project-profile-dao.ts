import { type ProjectProfileResponse } from '@rfcx-bio/common/api-bio/project-profile/project-profile'
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

export const getProjectProfile = async (locationProjectId: number): Promise<ProjectProfileResponse> =>
  await ModelRepository.getInstance(getSequelize())
    .LocationProjectProfile
    .findOne({
      where: { locationProjectId },
      attributes: ['summary', 'objectives'],
      raw: true
    }) ?? { summary: '', objectives: [] }

export const updateProjectProfile = async (locationProjectId: number, summary: string | undefined, objectives: string[]): Promise<ProjectProfileResponse> => {
  const locationProjectProfile = ModelRepository.getInstance(getSequelize()).LocationProjectProfile
  const res = await locationProjectProfile.update({ summary, objectives }, { where: { locationProjectId }, returning: true })
  if (res[0] === 0) throw new Error(`Failed to update project profile for locationProjectId: ${locationProjectId}`)
  const updated = res[1][0].get({ plain: true })
  return updated
}

export const getProjectSettings = async (locationProjectId: number): Promise<ProjectSettingsResponse> => {
  const locationProject = ModelRepository.getInstance(getSequelize()).LocationProject
  const locationProjectProfile = ModelRepository.getInstance(getSequelize()).LocationProjectProfile
  const resProject = await locationProject.findOne({
    where: { id: locationProjectId },
    attributes: ['name'],
    raw: true
  })
  const resProfile = await locationProjectProfile.findOne({
    where: { locationProjectId },
    attributes: ['summary', 'objectives'],
    raw: true
  })
  if (!resProject) throw new Error(`Failed to get project settings for locationProjectId: ${locationProjectId}`)
  return {
    name: resProject.name,
    summary: resProfile?.summary ?? '',
    objectives: resProfile?.objectives ?? []
  }
}

export const updateProjectSettings = async (locationProjectId: number, settings: ProjectSettingsUpdateBody): Promise<ProjectSettingsResponse> => {
  if (settings.name) {
    const locationProject = ModelRepository.getInstance(getSequelize()).LocationProject
    await locationProject.update({ name: settings.name }, { where: { id: locationProjectId } })
  }
  await updateProjectProfile(locationProjectId, settings.summary, settings.objectives ?? [])
  return await getProjectSettings(locationProjectId)
}
