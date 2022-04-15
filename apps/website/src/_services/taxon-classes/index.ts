import { masterTaxonClasses, TaxonClassId } from '@rfcx-bio/common/dao/master-data'

export interface TaxonClassUi {
  color: string
  symbol: string
}

export const TAXON_CLASSES_BY_ID: Record<TaxonClassId, TaxonClassUi> = {
  [masterTaxonClasses.Others.id]: { symbol: '❔', color: '#B177FC' },
  [masterTaxonClasses.Amphibians.id]: { symbol: '🐸', color: '#02A84F' },
  [masterTaxonClasses.Bats.id]: { symbol: '🦇', color: '#0B378A' },
  [masterTaxonClasses.Birds.id]: { symbol: '🐦', color: '#E043A9' },
  [masterTaxonClasses.Fish.id]: { symbol: '🐟', color: '#1259DE' },
  [masterTaxonClasses.Insects.id]: { symbol: '🦟', color: '#A80915' },
  [masterTaxonClasses.Mammals.id]: { symbol: '🐗', color: '#F5A700' }
}
