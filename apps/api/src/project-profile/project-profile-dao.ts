import { pickBy } from 'lodash-es'

import type { ProjectInfoFieldType, ProjectInfoResponse, ProjectProfileUpdateBody, ProjectProfileUpdateResponse, ProjectSettingsResponse } from '@rfcx-bio/common/api-bio/project-profile/project-settings'
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

export const updateProjectProfile = async (locationProjectId: number, profile: ProjectProfileUpdateBody): Promise<ProjectProfileUpdateResponse> => {
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

export const getProjectInfo = async (locationProjectId: number, fields: ProjectInfoFieldType[]): Promise<ProjectInfoResponse> => {
  console.log('getProjectInfo', locationProjectId, fields)
  const sequelize = getSequelize()
  const { LocationProject, LocationProjectProfile, LocationProjectCountry, ProjectVersion, LocationProjectMetric } = ModelRepository.getInstance(sequelize)
  const resProject = await LocationProject.findOne({
    where: { id: locationProjectId },
    attributes: ['name'],
    raw: true
  })
  const resProfile = await LocationProjectProfile.findOne({
    where: { locationProjectId },
    attributes: ['summary', 'objectives', 'dateStart', 'dateEnd', 'readme', 'keyResult'],
    raw: true
  })

  // TODO: support stakeholder

  const version = await ProjectVersion.findOne({
    where: { locationProjectId },
    attributes: ['isPublished'],
    raw: true
  })

  // TODO: make country optional
  let resCountry
  if (fields.includes('countryCodes')) {
    resCountry = await LocationProjectCountry.findOne({
      where: { locationProjectId },
      raw: true
    })
  }

  let metrics
  if (fields.includes('metrics')) {
    metrics = await LocationProjectMetric.findOne({
      where: { locationProjectId },
      raw: true
    })
  }

  if (!resProject) throw new Error(`Failed to get project settings for locationProjectId: ${locationProjectId}`)
  const baseProject = {
    name: resProject.name,
    summary: resProfile?.summary ?? '',
    objectives: resProfile?.objectives ?? [],
    dateStart: resProfile?.dateStart ?? null,
    dateEnd: resProfile?.dateEnd ?? null,
    isPublished: version?.isPublished ?? false
  }

  return {
    ...baseProject,
    ...(fields.includes('readme') ? { readme: resProfile?.readme ?? '' } : {}),
    ...(fields.includes('keyResults') ? { keyResults: resProfile?.keyResult ?? '' } : {}),
    ...(fields.includes('image') ? { image: '' } : {}),
    ...(fields.includes('countryCodes') ? { countryCodes: resCountry?.countryCodes ?? [] } : {}),
    ...(fields.includes('metrics')
? {
 metrics: metrics
? {
      recordingMinutesCount: metrics.recordingMinutesCount,
      speciesCount: metrics.speciesCount,
      siteCount: metrics.siteCount,
      detectionMinutesCount: metrics.detectionMinutesCount
    }
: undefined
}
: {})
  }
}

export const getProjectSettings = async (locationProjectId: number): Promise<ProjectSettingsResponse> => {
  return await getProjectInfo(locationProjectId, ['name', 'summary', 'objectives', 'dateStart', 'dateEnd', 'countryCodes', 'isPublished'])
}

export const updateProjectSettings = async (locationProjectId: number, settings: ProjectProfileUpdateBody): Promise<ProjectSettingsResponse> => {
  if (settings.name) {
    const locationProject = ModelRepository.getInstance(getSequelize()).LocationProject
    await locationProject.update({ name: settings.name }, { where: { id: locationProjectId } })
  }
  await updateProjectProfile(locationProjectId, settings)
  return await getProjectSettings(locationProjectId)
}
