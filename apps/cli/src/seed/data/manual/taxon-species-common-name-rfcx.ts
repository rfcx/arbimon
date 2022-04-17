import { SeedTaxonSpeciesCommonName } from '../types'

export const taxonSpeciesCommonNameRfcx: SeedTaxonSpeciesCommonName[] = [
  { slug: 'accipiter-striatus venator', commonName: 'Puerto Rican sharp-shinned hawk' }, // Missing in IUCN
  { slug: 'contopus-latirostris blancoi', commonName: 'Puerto Rican pewee' }, // Missing in IUCN
  { slug: 'butorides-virescens', commonName: 'Green heron' }, // Missing in IUCN (IUCN website redirects incorrectly to Butorides striata)
  { slug: 'gallus-gallus-domesticus', commonName: 'Chicken' }, // Missing in IUCN
  { slug: 'himantopus-mexicanus', commonName: 'Black-necked stilt' }, // Missing in IUCN (IUCN website redirects incorrectly to Himantopus himantopus)
  { slug: 'fulica-caribaea', commonName: 'American coot' }, // Solveable via alias: Fulica americana
  { slug: 'porphyrio-martinica', commonName: 'Purple gallinule' }, // Solveable via alias: Porphyrio martinicus
  { slug: 'loxigilla-portoricensis', commonName: 'Puerto Rican bullfinch' } // Solveable via alias: Pyrrhulagra portoricensis
]
