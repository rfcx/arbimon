import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { getArbimonDetectionSummaries, tranformArbimonToBioDetectionSummaries } from '@/ingest/inputs/arbimon-detections'
import { getArbimonProjects, tranformArbimonToBioProjects } from '@/ingest/inputs/arbimon-projects'
import { getArbimonRecordingSummaries, tranformArbimonToBioRecordingSummaries } from '@/ingest/inputs/arbimon-recordings'
import { getArbimonSitesByProjectId, tranformArbimonToBioProjectSites } from '@/ingest/inputs/arbimon-sites'
import { writeProjectsToPostgres } from '@/ingest/outputs/projects'
import { createSitesIfNeeded } from '@/ingest/outputs/sites'
import { createDetections } from '@/ingest/outputs/source-detections'
import { createRecordings } from '@/ingest/outputs/source-recordings'

export const syncProjects = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  const arbimonProjects = await getArbimonProjects(arbimonSequelize)
  const projects = tranformArbimonToBioProjects(arbimonProjects)
  await writeProjectsToPostgres(biodiversitySequelize, projects)
}

export const syncSites = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, projects: Project[]): Promise<void> => {
  for (const project of projects) {
    console.info(`- sync sites for ${project.name}`)
    const version = await (ModelRepository.getInstance(biodiversitySequelize).ProjectVersion
      .findOne({
        where: { projectId: project.id },
        order: [['created_at', 'DESC']],
        raw: true
      }))
      .then(pv => pv?.id)

    if (version === undefined) return // TODO: handle error where there is no project version

    const arbimonSites = await getArbimonSitesByProjectId(arbimonSequelize, project.idArbimon)
    const sites = tranformArbimonToBioProjectSites(arbimonSites, project.id, version)
    await createSitesIfNeeded(biodiversitySequelize, sites)
  }
}

export const syncRecordings = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, projects: Project[]): Promise<void> => {
  const arbimonRecordingSummaries = await getArbimonRecordingSummaries(arbimonSequelize, projects.map(p => p.idArbimon))
  const recordingSummaries = await tranformArbimonToBioRecordingSummaries(arbimonRecordingSummaries, biodiversitySequelize)
  console.log(recordingSummaries)
  await createRecordings(biodiversitySequelize, recordingSummaries)
}

export const syncDetections = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, projects: Project[]): Promise<void> => {
  const arbimonDetectionSummaries = await getArbimonDetectionSummaries(arbimonSequelize, projects.map(p => p.idArbimon))
  const detectionSummaries = await tranformArbimonToBioDetectionSummaries(arbimonDetectionSummaries, biodiversitySequelize)
  console.log(detectionSummaries)
  await createDetections(biodiversitySequelize, detectionSummaries)
}
