import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_LOCATION_PROJECT } from '@rfcx-bio/common/dao/models/location-project-model'
import { Project, SyncError } from '@rfcx-bio/common/dao/types'

import { getTransformedProjects, ProjectArbimon, transformProjectArbimonToProjectBio } from '../parsers/parse-project-arbimon-to-bio'

const loopUpsert = async (projects: ProjectArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  for (const project of projects) {
    try {
      await ModelRepository.getInstance(sequelize).LocationProject.upsert(transformProjectArbimonToProjectBio(project))
    } catch (e: any) {
      const errorMessage = (e instanceof Error) ? e.message : ''
      // store insert errors
      failedToInsertItems.push({
        externalId: `${project.idArbimon}`,
        error: `InsertError: ${errorMessage}`
      })
    }
  }
  return failedToInsertItems
}

export const writeProjectsToBio = async (projects: ProjectArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const [itemsToInsertOrUpsert, itemsToReset] = await Promise.all(await getTransformedProjects(projects, sequelize))

  // Remove deleted projects
  await deleteProjects(itemsToReset as Project[], sequelize)
  // Insert/upsert projects
  try {
    if ((itemsToInsertOrUpsert as Omit<Project, "id">[]).length) {
      await ModelRepository.getInstance(sequelize)
        .LocationProject
        .bulkCreate(itemsToInsertOrUpsert, {
          updateOnDuplicate: UPDATE_ON_DUPLICATE_LOCATION_PROJECT,
          ...transaction && { transaction }
        })
    }
    return []
  } catch (batchInsertError) {
    console.info('⚠️ Batch insert failed... try loop upsert')
    return await loopUpsert(projects, sequelize)
  }
}

const deleteProjects = async (projects: Project[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<void> => {
  if (!projects.length) return
  try {
    for (const p of projects) {
      // 1st step: remove project data
      await deleteProjectData(p.id, sequelize, transaction)
      // 2nd step: remove project
      const numberOfDeletedRows = await ModelRepository.getInstance(sequelize)
        .LocationProject
        .destroy({
          where: { id: p.id },
          transaction
        })
        console.info(`> ${numberOfDeletedRows} projects reset successfully`)
    }
  } catch (err) {
    // TODO: Inform about the issue to the bio dev slack channel?
    const ids = projects.map(project => project.id).map(String)
    console.error(`> Error when deleting projects ${ids}`, err)
  }
}

// TODO: Make this function universal for use with sites
const deleteProjectData = async (projectId: number, sequelize: Sequelize, transaction: Transaction | null = null): Promise<void> => {
  await ModelRepository.getInstance(sequelize).SyncLogByProject.destroy({ where: { locationProjectId: projectId }, transaction })
  await ModelRepository.getInstance(sequelize).LocationProjectSpecies.destroy({ where: { locationProjectId: projectId }, transaction })
  await ModelRepository.getInstance(sequelize).DataSource.destroy({ where: { locationProjectId: projectId }, transaction })
  await ModelRepository.getInstance(sequelize).DetectionBySiteSpeciesHour.destroy({ where: { locationProjectId: projectId }, transaction })
  await ModelRepository.getInstance(sequelize).RecordingBySiteHour.destroy({ where: { locationProjectId: projectId }, transaction })
  await ModelRepository.getInstance(sequelize).LocationSite.destroy({ where: { locationProjectId: projectId }, transaction })
  await ModelRepository.getInstance(sequelize).LocationProjectProfile.destroy({ where: { locationProjectId: projectId }, transaction })
  await ModelRepository.getInstance(sequelize).ProjectVersion.destroy({ where: { locationProjectId: projectId }, transaction })
}
