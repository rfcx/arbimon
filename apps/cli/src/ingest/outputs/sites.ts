import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ProjectSite } from '@rfcx-bio/common/dao/types'

export const createSitesIfNeeded = async (sequelize: Sequelize, sites: Array<Omit<ProjectSite, 'id'>>): Promise<void> => {
  const model = ModelRepository.getInstance(sequelize).ProjectSite
  await Promise.all(sites.map(async (site) => {
    return await model.findOrCreate({
      defaults: site,
      where: { idArbimon: site.idArbimon }
    })
  }))
}
