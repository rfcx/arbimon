import { SPECIES_SOURCE_PROJECT, SpeciesSource } from '@rfcx-bio/common/api-bio/species/common'
import { ExtinctionRiskCode } from '@rfcx-bio/common/iucn'

export interface RfcxSpeciesData {
  commonName?: string
  extinctionRisk?: { code: ExtinctionRiskCode, source: SpeciesSource }
}

export const getRfcxSpecies = (): Record<string, RfcxSpeciesData> =>
  ({
    'Accipiter striatus venator': {
      commonName: 'Puerto Rican sharp-shinned hawk',
      extinctionRisk: { code: 'CR', source: SPECIES_SOURCE_PROJECT }
    },
    'Buteo platypterus brunnescens': {
      commonName: 'Puerto Rican broad-winged hawk',
      extinctionRisk: { code: 'CR', source: SPECIES_SOURCE_PROJECT }
    },
    'Butorides virescens': {
      commonName: 'Green heron'
    },
    'Contopus latirostris blancoi': {
      commonName: 'Puerto Rican pewee'
    },
    'Equus caballus': {
      commonName: 'Horse'
    },
    'Fulica caribaea': {
      commonName: 'Caribbean coot'
    },
    'Gallus gallus domesticus': {
      commonName: 'Chicken'
    },
    'Himantopus mexicanus': {
      commonName: 'Black-necked stilt'
    },
    'Loxigilla portoricensis': {
      commonName: 'Puerto Rican bullfinch'
    },
    'Porphyrio martinica': {
      commonName: 'American purple gallinule'
    },
    'Tiaris bicolor': {
      commonName: 'Black-faced grassquit'
    }
  })
