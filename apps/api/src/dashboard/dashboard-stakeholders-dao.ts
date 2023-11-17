import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type OrganizationTypes } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'

export const getProjectStakeholders = async (projectId: number): Promise<Array<OrganizationTypes['light']>> => {
  const sequelize = getSequelize()
  const { Organization, LocationProject } = ModelRepository.getInstance(sequelize)

  const organization = await LocationProject.findOne({
    where: {
      id: projectId
    },
    include: Organization
  })

  if (organization == null) {
    throw BioNotFoundError()
  }

  // The cast here is to satisfy typescript.
  const orgs = organization.get('Organization', { plain: true }) as Array<OrganizationTypes['light']>

  return orgs.map(o => {
    return {
      id: o.id,
      name: o.name,
      type: o.type,
      url: o.url,
      image: o.image
    }
  })
}

export const updateProjectStakeholdersOrganization = async (projectId: number, organizationIds: number[]): Promise<void> => {
  const sequelize = getSequelize()
  const { LocationProjectOrganization } = ModelRepository.getInstance(sequelize)

  await sequelize.transaction(async t => {
    await LocationProjectOrganization.destroy({ where: { locationProjectId: projectId }, transaction: t })
    await LocationProjectOrganization.bulkCreate(organizationIds.map(o => ({ locationProjectId: projectId, organizationId: o })), { transaction: t })
  })
}
