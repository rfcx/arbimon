import { TaxonSpeciesRfcx } from '@rfcx-bio/common/dao/types/taxon-species-rfcx'

export const taxonSpeciesRfcx: Record<string, Partial<TaxonSpeciesRfcx>> =
  ({
    'Accipiter striatus venator': { // Missing in IUCN
      commonName: 'Puerto Rican sharp-shinned hawk'
    },
    'Contopus latirostris blancoi': { // Missing in IUCN
      commonName: 'Puerto Rican pewee'
    },
    'Butorides virescens': { // Missing in IUCN (IUCN website redirects incorrectly to Butorides striata)
      commonName: 'Green heron'
    },
    'Gallus gallus domesticus': { // Missing in IUCN
      commonName: 'Chicken'
    },
    'Himantopus mexicanus': { // Missing in IUCN (IUCN website redirects incorrectly to Himantopus himantopus)
      commonName: 'Black-necked stilt'
    },
    'Fulica caribaea': { // Solveable via alias: Fulica americana
      commonName: 'American coot'
    },
    'Porphyrio martinica': { // Solveable via alias: Porphyrio martinicus
      commonName: 'Purple gallinule'
    },
    'Loxigilla portoricensis': { // Solveable via alias: Pyrrhulagra portoricensis
      commonName: 'Puerto Rican bullfinch'
    }
  })
