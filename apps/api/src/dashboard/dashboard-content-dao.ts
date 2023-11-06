import { type DashboardContentResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type LocationProjectProfileContentType } from '@rfcx-bio/common/dao/types'

import { checkUserPermissionForEditingDashboardContent } from '~/api-core/api-core'
import { getSequelize } from '~/db'
import { BioPublicError } from '~/errors'
import { sqlValues } from './sql-values'

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

  const { LocationProject } = ModelRepository.getInstance(sequelize)

  const project = await LocationProject.findOne({ where: { id: locationProjectId } })

  if (project == null) {
    throw new BioPublicError('Project with given ID not found', 404)
  }

  const editable = await checkUserPermissionForEditingDashboardContent(token, project.get('idCore'), project.get('name'))

  if (!editable) {
    throw new BioPublicError('You are not allowed to edit this content', 403)
  }

  const values = sqlValues(contentType, value)

  await sequelize.query(`
    insert into location_project_profile (
      location_project_id,
      created_at,
      updated_at,
      ${values.keys}
    ) values (
      ${locationProjectId},
      now(),
      now(),
      ${values.values}
    ) on conflict (location_project_id) do update set ${values.updateClause}, updated_at = now();`)
}
