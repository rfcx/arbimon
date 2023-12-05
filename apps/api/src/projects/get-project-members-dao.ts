import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const get = async (locationProjectId: number): Promise<string | null> => {
  const sequelize = getSequelize()
  const { LocationProject } = ModelRepository.getInstance(sequelize)

  const project = await LocationProject.findOne({ where: { id: locationProjectId } })

  return project?.get('idCore') ?? null
}
