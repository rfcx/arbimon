import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type LocationProjectProfile } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'

export const getProjectProfile = async (locationProjectId: number): Promise<LocationProjectProfile> =>
  await ModelRepository.getInstance(getSequelize())
    .LocationProjectProfile
    .findOne({
      where: { locationProjectId },
      attributes: ['summary', 'readme'],
      raw: true
    }) ?? { locationProjectId, summary: '', readme: '' }

export const updateProjectProfile = async (locationProjectId: number, summary: string, readme: string): Promise<LocationProjectProfile | undefined> => {
  let updated
  const locationProjectProfile = await ModelRepository.getInstance(getSequelize())
    .LocationProjectProfile
    .findOne({ where: { locationProjectId } })

  if (locationProjectProfile) {
    updated = await locationProjectProfile.update({ summary, readme })
  }

  return updated
}
