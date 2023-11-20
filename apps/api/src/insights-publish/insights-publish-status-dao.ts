import { type GetInsightsPublishStatusResponseBody } from '@rfcx-bio/common/api-bio/insights-publish-status/insights-publish-status'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'

export const getInsightsPublishStatus = async (projectId: number): Promise<GetInsightsPublishStatusResponseBody> => {
  const sequelize = getSequelize()

  const { ProjectVersion } = ModelRepository.getInstance(sequelize)

  const version = await ProjectVersion.findOne({ where: { locationProjectId: projectId } })

  if (version == null) {
    throw BioNotFoundError()
  }

  return {
    status: version.get('isPublished')
  }
}

export const updateInsightsPublishStatus = async (projectId: number, status: boolean): Promise<void> => {
  const sequelize = getSequelize()

  const { ProjectVersion } = ModelRepository.getInstance(sequelize)

  // find if there's one query now. if findOne found. do an update. if not insert
  const version = await ProjectVersion.findOne({ where: { locationProjectId: projectId } })

  if (version == null) {
    await ProjectVersion.create({ locationProjectId: projectId, isPublished: status, isPublic: false }, { returning: true })
    return
  }

  await ProjectVersion.update({ isPublished: status }, { where: { id: version.get('id'), locationProjectId: projectId } })
}
