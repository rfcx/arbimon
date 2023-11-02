import { type ProjectProfileResponse } from '@rfcx-bio/common/api-bio/project-profile/project-profile'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const getProjectProfile = async (locationProjectId: number): Promise<ProjectProfileResponse> =>
  await ModelRepository.getInstance(getSequelize())
    .LocationProjectProfile
    .findOne({
      where: { locationProjectId },
      attributes: ['summary', 'objectives'],
      raw: true
    }) ?? { summary: '', objectives: [] }

export const updateProjectProfile = async (locationProjectId: number, summary: string | undefined, objectives: string[]): Promise<ProjectProfileResponse | undefined> => {
  const locationProjectProfile = ModelRepository.getInstance(getSequelize()).LocationProjectProfile
  const res = await locationProjectProfile.update({ summary, objectives }, { where: { locationProjectId }, returning: true })
  if (res[0] === 0) return undefined
  const updated = res[1][0].get({ plain: true })
  return updated
}
