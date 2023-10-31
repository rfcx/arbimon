import { type DashboardContentResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type LocationProjectProfileContentType } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'

export const getDashboardContent = async (locationProjectId: number): Promise<DashboardContentResponse> => {
  const sequelize = getSequelize()
  const { LocationProjectProfile } = ModelRepository.getInstance(sequelize)

  const data = await LocationProjectProfile
    .findOne({
      where: { locationProjectId },
      attributes: ['locationProjectId', 'readme', 'keyResult', 'resources', 'methods'],
      raw: true
    }) ?? { locationProjectId, readme: '', keyResult: '', resources: '', methods: '' }

  return { ...data }
}

export const updateDashboardContent = async (locationProjectId: number, contentType: LocationProjectProfileContentType, value: string): Promise<void> => {
  const toUpdate = {
    [contentType]: value
  }

  await ModelRepository.getInstance(getSequelize()).LocationProjectProfile.update(toUpdate, { where: { locationProjectId } })
}
