import { Optional, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { TaxonSpecies } from '@rfcx-bio/common/dao/types'
import { rawSpecies, TAXONOMY_CLASSES } from '@rfcx-bio/common/mock-data'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const model = TaxonSpeciesModel(params.context.sequelize)

  const taxonClassArbimonToBio = Object.fromEntries(
    TAXONOMY_CLASSES.map(t => [t.idArbimon, t.id])
  )

  // TODO: Fix source data
  const data: Array<Optional<TaxonSpecies, 'id'>> =
    rawSpecies.map(s => ({
      idArbimon: s.speciesId,
      slug: s.speciesSlug,
      taxonClassId: taxonClassArbimonToBio[s.taxonId],
      scientificName: s.scientificName,
      commonName: s.commonName,
      extinctionRiskRating: s.extinctionRisk,
      extinctionRiskRatingSource: '', // WRONG
      description: s.information[0]?.description ?? '', // WRONG
      descriptionSource: s.information[0]?.sourceType ?? '', // WRONG
      descriptionSourceUrl: s.information[0]?.sourceUrl ?? '', // WRONG
      callProjectId: 1,
      callSiteId: 1, // WRONG
      callType: s.speciesCall?.songType ?? '', // WRONG
      callRecordedAt: new Date(), // WRONG
      callTimezone: s.speciesCall?.timezone ?? '', // WRONG
      callMediaWavUrl: s.speciesCall?.mediaWavUrl ?? '', // WRONG
      callMediaSpecUrl: s.speciesCall?.mediaSpecUrl ?? '', // WRONG
      photoUrl: s.thumbnailImageUrl ?? '', // WRONG
      photoCaption: s.imageCaption,
      photoAuthor: '', // Doesn't exist yet
      photoLicense: '', // Doesn't exist yet
      photoLicenseUrl: '' // Doesn't exist yet
    }))

  await model.bulkCreate(data)
}
