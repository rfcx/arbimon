import { type SpeciesSource, SPECIES_SOURCE_PROJECT } from '@rfcx-bio/common/api-bio/species/types'

export interface RfcxSpeciesData {
  commonName?: string
  extinctionRisk?: { code: string, source: SpeciesSource }
}

// TODO - Rename horse to `Equus ferus caballus` in Arbimon & remove `Equus caballus` here
// TODO 412 - Consider getting common name from Wikipedia (if not in IUCN)
// TODO 475 - Lookup species in IUCN using synonynms
/**
 * @deprecated - Replace to-mock with an implementation that is db-driven
 */
export const getRfcxSpecies = (): Record<string, RfcxSpeciesData> =>
  ({
    // Incorrectly named in Arbimon => should be named `Equus ferus caballus`
    'Equus caballus': {
      commonName: 'Horse'
    },
    // Missing in IUCN (and override extinction risk)
    'Accipiter striatus venator': {
      commonName: 'Puerto Rican sharp-shinned hawk',
      extinctionRisk: { code: 'CR', source: SPECIES_SOURCE_PROJECT } // PRDNER 2016
    },
    // Missing in IUCN (and override extinction risk)
    'Buteo platypterus brunnescens': {
      commonName: 'Puerto Rican broad-winged hawk',
      extinctionRisk: { code: 'CR', source: SPECIES_SOURCE_PROJECT } // PRDNER 2015
    },
    // Missing in IUCN
    'Contopus latirostris blancoi': {
      commonName: 'Puerto Rican pewee'
    },
    // Missing in IUCN (website redirect incorrectly to Butorides striata)
    'Butorides virescens': {
      commonName: 'Green heron'
    },
    // Missing in IUCN
    'Gallus gallus domesticus': {
      commonName: 'Chicken'
    },
    // Missing in IUCN (website redirect incorrectly to Himantopus himantopus)
    'Himantopus mexicanus': {
      commonName: 'Black-necked stilt'
    },
    // In IUCN under Fulica americana
    'Fulica caribaea': {
      commonName: 'American coot'
    },
    // In IUCN under Porphyrio martinicus
    'Porphyrio martinica': {
      commonName: 'Purple gallinule'
    },
    // In IUCN under Pyrrhulagra portoricensis
    'Loxigilla portoricensis': {
      commonName: 'Puerto Rican bullfinch'
    },
    // In IUCN under Melanospiza bicolor
    'Tiaris bicolor': {
      commonName: 'Black-faced grassquit'
    }
  })
