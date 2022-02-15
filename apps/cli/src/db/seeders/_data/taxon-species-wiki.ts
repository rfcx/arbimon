import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { TaxonSpeciesWikiModel } from '@rfcx-bio/common/dao/models/taxon-species-wiki-model'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { getWikiSummary } from '../../../data-ingest/species/input-wiki'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize
  const allSpecies = await TaxonSpeciesModel(sequelize).findAll()

  const wikiInfo = await Promise.all(allSpecies.map(async (s) => ({ ...await getWikiSummary(s.scientificName), id: s.id })))

  // Convert data
  const data =
    wikiInfo.map(({ id, credit, license, licenseUrl }) => {
      return {
        id,
        photoAuthor: credit,
        photoLicense: license,
        photoLicenseUrl: licenseUrl
      }
    })
    .filter(isDefined)

    for (const wiki of data) {
    try {
      console.warn(wiki)
      const { id, ...updateInfo } = wiki
      await TaxonSpeciesWikiModel(sequelize).update(updateInfo, { where: { taxonSpeciesId: id } })
    } catch (e) {
      console.error(e)
    }
  }
}
