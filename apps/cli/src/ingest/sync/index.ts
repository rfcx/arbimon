import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { createProjectVersionIfNeeded } from '@/ingest/outputs/project-version'
import { syncProjects, syncSites } from '@/ingest/sync/arbimon'

export const syncDaily = async (arbimonSequelize: Sequelize, bioSequelize: Sequelize): Promise<void> => {
  console.info('Daily sync start')
  try {
    await syncProjects(arbimonSequelize, bioSequelize)

    const allProjects = (await ModelRepository.getInstance(bioSequelize).Project.findAll({ raw: true }))
    const allProjectIds = allProjects.map(p => p.id)
    await createProjectVersionIfNeeded(bioSequelize, allProjectIds)
    await syncSites(arbimonSequelize, bioSequelize, allProjects)
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Daily sync end: failed')
  }
}

export const syncIncremental = async (arbimonSequelize: Sequelize, bioSequelize: Sequelize): Promise<void> => {}

export const syncAfterMigration = async (arbimonSequelize: Sequelize, bioSequelize: Sequelize): Promise<void> => {}
