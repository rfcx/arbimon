import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { getArbimonSequelize } from '@/data-ingest/_connections/arbimon'
import { getSequelize } from '@/db/connections'
import { syncAllForProject } from './all'

const exitWithError = (errorMessage: string): void => {
  console.error(errorMessage)
  process.exitCode = 0
}

const resetDetections = async (projectId: number, sequelize: Sequelize): Promise<void> => {
  console.info('STEP: resetting detections', projectId)
  const numberOfDeletedRows = await ModelRepository
    .getInstance(sequelize)
    .DetectionBySiteSpeciesHour
    .destroy({
      where: { locationProjectId: projectId }
    })
    console.info(`> ${numberOfDeletedRows} detections reset successfully`)
}

const resetDataSource = async (projectId: number, sequelize: Sequelize): Promise<void> => {
  console.info('STEP: resetting data sources', projectId)
  const numberOfDeletedRows = await ModelRepository
    .getInstance(sequelize)
    .DataSource
    .destroy({
      where: { locationProjectId: projectId }
    })
  console.info(`> ${numberOfDeletedRows} data source reset successfully`)
}

const resync = async (project: Project, arbimonSequelize: Sequelize, bioSequelize: Sequelize): Promise<void> => {
  console.info('STEP: resync', project.id)
  await syncAllForProject(arbimonSequelize, bioSequelize, project)
  console.info('----')
}

const main = async (): Promise<void> => {
  const slug = process.argv.find(arg => arg.startsWith('--slug='))?.split('=')[1].toLowerCase()
  if (slug === undefined) {
    exitWithError('Error: Please provide project slug, for example: pnpm serve lib/sync/reset-and-resync.js -- --slug=rfcx-th')
    return
  }

  const arbimonSequelize = getArbimonSequelize()
  const bioSequelize = getSequelize()

  const project = await ModelRepository.getInstance(bioSequelize).LocationProject.findOne({ where: { slug }, raw: true })
  const projectId = project?.id ?? null

  if (project === null || projectId === null) {
    exitWithError('Error: No project with this slug')
    return
  }

  await resetDetections(projectId, bioSequelize)
  await resetDataSource(projectId, bioSequelize)
  await resync(project, arbimonSequelize, bioSequelize)
}

await main()
