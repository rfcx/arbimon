import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Site } from '@rfcx-bio/common/dao/types'

export const writeSitesToPostgres = async (sequelize: Sequelize, sites: Array<Omit<Site, 'id'>>): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  await models.ProjectSite
    .bulkCreate(sites, {
       ignoreDuplicates: true
    })
    .then(async () => {
      // fix auto increment key break - https://github.com/sequelize/sequelize/issues/9295
      await sequelize.query('select setval(\'location_site_id_seq\', (select max(id) from location_site), true);')
    })
}
