import { Model, Op, Optional, Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_LOCATION_PROJECT } from '@rfcx-bio/common/dao/models/location-project-model'
import { Project, SyncError } from '@rfcx-bio/common/dao/types'

import { getTransformedProjects, ProjectArbimon } from '../parsers/parse-project-arbimon-to-bio'

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

  // Insert new and update existing project versions
  await upsertProjectVersions(itemsToInsertOrUpsert, sequelize)

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
      await ModelRepository.getInstance(sequelize).ProjectVersion.destroy({ where: { locationProjectId: p.id }, transaction })
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

const upsertProjectVersions = async (projects: Array<Omit<Project, 'id'> & { isPrivate: number }>, sequelize: Sequelize): Promise<void> => {
  const { LocationProject, ProjectVersion } = ModelRepository.getInstance(sequelize)
  const projectsWithVersions: Array<Model<Project, Optional<Project, 'id'>> & Project & { 'ProjectVersion.id'?: string | null, 'ProjectVersion.isPublic'?: boolean | null }> = await LocationProject.findAll({
    where: { idArbimon: { [Op.in]: projects.map(p => p.idArbimon) } },
    raw: true,
    attributes: ['id', 'idArbimon'],
    include: {
      model: ProjectVersion,
      attributes: ['id', 'isPublic']
    }
  })
  const dict = Object.fromEntries(projectsWithVersions.map(p => [p.idArbimon, { id: p.id, versionId: p['ProjectVersion.id'], isPublic: p['ProjectVersion.isPublic'] }]))

  for (const project of projects) {
    const projectWithVersion = dict[project.idArbimon]
    if (projectWithVersion === undefined) continue
    const isPublic = project.isPrivate === 0
    if (projectWithVersion.versionId === null) {
      await ProjectVersion.create({ locationProjectId: projectWithVersion.id, isPublic, isPublished: false })
    } else if (isPublic !== projectWithVersion.isPublic) {
      await ProjectVersion.update({ isPublic }, { where: { id: projectWithVersion.versionId } })
    }
  }
}
