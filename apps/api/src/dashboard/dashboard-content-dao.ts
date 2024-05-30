import { type DashboardContentResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type LocationProjectProfileContentType } from '@rfcx-bio/node-common/dao/types'

import { checkUserPermissionForEditingDashboardContent } from '~/api-core/api-core'
import { getSequelize } from '~/db'
import { BioPublicError } from '~/errors'

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

export const updateDashboardContent = async (token: string, locationProjectId: number, contentType: LocationProjectProfileContentType, value: string): Promise<void> => {
  const sequelize = getSequelize()

  const { LocationProject, LocationProjectProfile } = ModelRepository.getInstance(sequelize)

  const project = await LocationProject.findOne({ where: { id: locationProjectId } })

  if (project == null) {
    throw new BioPublicError('Project with given ID not found', 404)
  }

  const editable = await checkUserPermissionForEditingDashboardContent(token, project.get('idCore'), project.get('name'))

  if (!editable) {
    throw new BioPublicError('You are not allowed to edit this content', 403)
  }

  const profile = await LocationProjectProfile.findOne({ where: { locationProjectId } })

  if (profile === null || profile === undefined) {
    const createObject = {
      locationProjectId,
      summary: '',
      readme: '',
      methods: '',
      keyResult: '',
      resources: '',
      image: ''
    }
    createObject[contentType] = value
    // @ts-expect-error the type mismatches but the amount of guards make this safe.
    await LocationProjectProfile.create(createObject)
    return
  }

  await LocationProjectProfile.update({ [contentType]: value }, { where: { locationProjectId } })
}
