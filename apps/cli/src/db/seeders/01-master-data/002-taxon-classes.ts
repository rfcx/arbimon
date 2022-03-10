import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { TaxonClassModel } from '@rfcx-bio/common/dao/models/taxon-class-model'

import { rawTaxonClasses } from '../_data/taxon-class'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await TaxonClassModel(params.context.sequelize)
    .bulkCreate(rawTaxonClasses)
}
