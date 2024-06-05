import { type Sequelize, type Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_LOCATION_PROJECT } from '@rfcx-bio/node-common/dao/models/location-project-model'
import { type Project, type SyncError } from '@rfcx-bio/node-common/dao/types'

import { type ProjectArbimon, getTransformedProjects } from '../parsers/parse-project-arbimon-to-bio'

const loopUpsert = async (projects: Array<Omit<Project, 'id'>>, sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  for (const project of projects) {
    try {
      await ModelRepository.getInstance(sequelize).LocationProject.upsert(project)
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

export const writeProjectsToBio = async (projects: ProjectArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const [itemsToInsertOrUpsert, itemsToReset] = await getTransformedProjects(projects, sequelize)

  // Remove deleted projects
  await deleteProjects(itemsToReset as Project[], sequelize)

  // Insert new and update existing projects
  // TODO: Should not use a single transaction for all rows
  const errors = await upsertProjects(itemsToInsertOrUpsert, sequelize, transaction)

  return errors
}

const upsertProjects = async (projects: Array<Omit<Project, 'id'>>, sequelize: Sequelize, transaction: Transaction | null = null): Promise<Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  try {
    if (projects.length > 0) {
      await ModelRepository.getInstance(sequelize)
        .LocationProject
        .bulkCreate(projects, {
          updateOnDuplicate: UPDATE_ON_DUPLICATE_LOCATION_PROJECT,
          ...transaction && { transaction }
        })
    }
    return []
  } catch (batchInsertError) {
    console.warn('⚠️ Batch insert failed... try loop upsert')
    return await loopUpsert(projects, sequelize)
  }
}

const deleteProjects = async (projects: Project[], sequelize: Sequelize): Promise<void> => {
  for (const p of projects) {
    const transaction = await sequelize.transaction()
    try {
      // Remove related data
      await ModelRepository.getInstance(sequelize).SyncLogByProject.destroy({ where: { locationProjectId: p.id }, transaction })
      await ModelRepository.getInstance(sequelize).DataSource.destroy({ where: { locationProjectId: p.id }, transaction })
      await ModelRepository.getInstance(sequelize).RecordingBySiteHour.destroy({ where: { locationProjectId: p.id }, transaction })
      await ModelRepository.getInstance(sequelize).DetectionBySiteSpeciesHour.destroy({ where: { locationProjectId: p.id }, transaction })
      await ModelRepository.getInstance(sequelize).TaxonSpeciesCall.destroy({ where: { callProjectId: p.id }, transaction })
      await ModelRepository.getInstance(sequelize).LocationProjectSpecies.destroy({ where: { locationProjectId: p.id }, transaction })
      await ModelRepository.getInstance(sequelize).LocationSite.destroy({ where: { locationProjectId: p.id }, transaction })
      await ModelRepository.getInstance(sequelize).LocationProjectProfile.destroy({ where: { locationProjectId: p.id }, transaction })
      // Remove project last
      await ModelRepository.getInstance(sequelize).LocationProject.destroy({ where: { id: p.id }, transaction })
      await transaction.commit()
      console.info(`> Project ${p.id} deleted successfully`)
    } catch (err) {
      await transaction.rollback()
      console.error(`> Error when deleting project ${p.id}`, err as Error)
      // TODO: should capture errors and return (like upsert)
    }
  }
}
