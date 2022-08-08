import { keyBy } from 'lodash-es'

import { masterTaxonClasses } from '@rfcx-bio/common/dao/master-data'
import { TaxonSpecies } from '@rfcx-bio/common/dao/types'

export const testSpecies: TaxonSpecies[] = [
  {
    id: 100001,
    idArbimon: 100001,
    slug: 'cat',
    taxonClassId: masterTaxonClasses.Mammals.id, // 600
    scientificName: 'Felis catus'
  },
  {
    id: 100002,
    idArbimon: 100002,
    slug: 'cobra',
    taxonClassId: masterTaxonClasses.Amphibians.id, // 100
    scientificName: 'Naja'
  },
  {
    id: 100003,
    idArbimon: 100003,
    slug: 'eagle',
    taxonClassId: masterTaxonClasses.Birds.id, // 300
    scientificName: 'Accipitridae'
  },
  {
    id: 100004,
    idArbimon: 100004,
    slug: 'sparrow',
    taxonClassId: masterTaxonClasses.Birds.id, // 300
    scientificName: 'Passeridae'
  },
  {
    id: 100005,
    idArbimon: 100005,
    slug: 'dog',
    taxonClassId: masterTaxonClasses.Mammals.id, // 600
    scientificName: 'Canis lupus familiaris'
  },
  {
    id: 100006,
    idArbimon: 100006,
    slug: 'watermonitor',
    taxonClassId: masterTaxonClasses.Amphibians.id, // 100
    scientificName: 'Varanus salvator'
  },
  {
    id: 100007,
    idArbimon: 100007,
    slug: 'cricket',
    taxonClassId: masterTaxonClasses.Insects.id, // 500
    scientificName: 'Grylloidea'
  },
  {
    id: 100008,
    idArbimon: 100008,
    slug: 'rooster',
    taxonClassId: masterTaxonClasses.Birds.id, // 300
    scientificName: 'Gallus gallus'
  },
  {
    id: 100009,
    idArbimon: 100009,
    slug: 'poison-dart-frog',
    taxonClassId: masterTaxonClasses.Amphibians.id, // 100
    scientificName: 'Dendrobatidae'
  }
]

export const taxonSpeciesById: Record<number, TaxonSpecies> = keyBy(testSpecies, 'id')

export const taxonSpeciesAndClassForId = (taxonSpeciesId: number): { taxonSpeciesId: number, taxonClassId: number } => ({
  taxonSpeciesId,
  taxonClassId: taxonSpeciesById[taxonSpeciesId].taxonClassId
})
