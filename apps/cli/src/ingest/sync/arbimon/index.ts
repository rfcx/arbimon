import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { getArbimonProjects, tranformArbimonToBioProjects } from '@/ingest/inputs/projects'
import { getArbimonSitesByProjectId, tranformArbimonToBioProjectSites } from '@/ingest/inputs/sites'
import { writeProjectsToPostgres } from '@/ingest/outputs/projects'
import { createSitesIfNeeded } from '@/ingest/outputs/sites'

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
    })).then(pv => pv?.id ?? -1) // TODO: handle error where there is no project version
    const arbimonSites = await getArbimonSitesByProjectId(arbimonSequelize, project.idArbimon)
    const sites = tranformArbimonToBioProjectSites(arbimonSites, project.id, version)
    await createSitesIfNeeded(biodiversitySequelize, sites)
  }
}
