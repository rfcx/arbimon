import { type DashboardContentResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const getProjectProfile = async (locationProjectId: number): Promise<DashboardContentResponse> =>
  await ModelRepository.getInstance(getSequelize())
    .LocationProjectProfile
    .findOne({
      where: { locationProjectId },
      attributes: ['summary', 'readme'],
      raw: true
    }) ?? { locationProjectId, summary: '', readme: '' }

export const updateProjectProfile = async (locationProjectId: number, summary: string | undefined, readme: string | undefined): Promise<DashboardContentResponse | undefined> => {
  const locationProjectProfile = ModelRepository.getInstance(getSequelize()).LocationProjectProfile
  const res = await locationProjectProfile.update({ summary, readme }, { where: { locationProjectId }, returning: true })
  if (res[0] === 0) return undefined
  const updated = res[1][0].get({ plain: true })
  return updated
}
