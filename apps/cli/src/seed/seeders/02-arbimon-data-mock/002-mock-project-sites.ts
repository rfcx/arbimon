import { Optional, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ProjectSite } from '@rfcx-bio/common/dao/types'

import { mockSites } from '../../data/manual/project-sites'
import { getPuertoRicoProjectId } from '../_helpers/get-puerto-rico-id'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Lookups
  const puertoRicoProjectId = await getPuertoRicoProjectId(sequelize)
  if (Number.isNaN(puertoRicoProjectId)) return

  const latestProjectVersion = await models.ProjectVersion.findOne({
    where: { projectId: puertoRicoProjectId },
    order: [['createdAt', 'DESC']]
  })
  if (!latestProjectVersion) return

  // Create sites
  const sites: Array<Optional<ProjectSite, 'id'>> = mockSites
    .map(site => ({
      projectId: puertoRicoProjectId,
      projectVersionFirstAppearsId: latestProjectVersion.id,
      ...site
    }))

  await models.ProjectSite.bulkCreate(sites)
}
