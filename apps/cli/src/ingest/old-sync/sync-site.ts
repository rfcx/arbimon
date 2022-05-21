import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { getArbimonSitesByProjectId, tranformArbimonToBioProjectSites } from '@/ingest/old-inputs/arbimon-sites'
import { createSitesIfNeeded } from '@/ingest/old-outputs/sites'

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
