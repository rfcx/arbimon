import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'

import { testSpecies } from '@/db/seeders/_data/integration/test-taxon-species'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  await models.TaxonSpecies.bulkCreate(testSpecies)
}
