import { type DashboardContentResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type LocationProjectProfileContentType } from '@rfcx-bio/common/dao/types'

import { checkUserPermissionForEditingDashboardContent } from '~/api-core/api-core'
import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'

export const getDashboardContent = async (token: string | undefined, locationProjectId: number): Promise<DashboardContentResponse> => {
  const sequelize = getSequelize()
  const { LocationProjectProfile, LocationProject } = ModelRepository.getInstance(sequelize)

  // get project information first
  const projectInfo = await LocationProject.findOne({ where: { id: locationProjectId } })

  if (projectInfo == null) {
    throw BioNotFoundError()
  }

  const isEditable = await checkUserPermissionForEditingDashboardContent(token, projectInfo.get('id_core') as string, projectInfo.get('name'))

  const data = await LocationProjectProfile
    .findOne({
      where: { locationProjectId },
      attributes: ['locationProjectId', 'readme', 'keyResult', 'resources'],
      raw: true
    }) ?? { locationProjectId, readme: '', keyResult: '', resources: '' }

  return { editable: isEditable, ...data }
}

export const updateDashboardContent = async (locationProjectId: number, contentType: LocationProjectProfileContentType, value: string): Promise<void> => {
  const toUpdate = {
    [contentType]: value
  }

  await ModelRepository.getInstance(getSequelize()).LocationProjectProfile.update(toUpdate, { where: { locationProjectId } })
}
