import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const updateInsightsPublishStatus = async (projectId: number, status: boolean): Promise<void> => {
  const sequelize = getSequelize()

  const { ProjectVersion } = ModelRepository.getInstance(sequelize)

  // find if there's one query now. if findOne found. do an update. if not insert
  const version = await ProjectVersion.findOne({ where: { locationProjectId: projectId } })

  if (version == null) {
    await ProjectVersion.create({ locationProjectId: projectId, isPublished: status, isPublic: true }, { returning: true })
    return
  }

  if (status) {
    // if status is true, then set isPublic to true
    await ProjectVersion.update({ isPublished: status, isPublic: true }, { where: { id: version.get('id'), locationProjectId: projectId } })
  } else {
    // update isPublished without overwriting isPublic
    await ProjectVersion.update({ isPublished: status }, { where: { id: version.get('id'), locationProjectId: projectId } })
  }
}
