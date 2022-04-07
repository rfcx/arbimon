import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { sources } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize
  const models = ModelRepository.getInstance(sequelize)

  await models.Source.bulkCreate(sources)
}
