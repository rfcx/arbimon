import { Optional, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { TaxonClassModel } from '@rfcx-bio/common/dao/models/taxon-class-model'
import { TaxonClass } from '@rfcx-bio/common/dao/types'
import { TAXONOMY_CLASSES } from '@rfcx-bio/common/mock-data'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const model = TaxonClassModel(params.context.sequelize)

  const data: Array<Optional<TaxonClass, 'id'>> =
    TAXONOMY_CLASSES.map(({ idArbimon, slug, name: commonName }) => ({
      idArbimon,
      slug,
      commonName
    }))

  await model.bulkCreate(data)
}
