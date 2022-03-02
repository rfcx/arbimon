export interface TaxonClassUi {
  commonName: string
  color: string
  symbol: string
}

/**
 * WARNING: Taxon Class IDs must match the Bio Database IDs
 */
// TODO: Replace id with idOrdered & space them out
export const DEFAULT_TAXON_ID = 7
export const TAXON_CLASSES_BY_ID: Record<number, TaxonClassUi> = {
  1: { commonName: 'Amphibians', symbol: '🐸', color: '#02A84F' },
  2: { commonName: 'Bats', symbol: '🦇', color: '#0B378A' },
  3: { commonName: 'Birds', symbol: '🐦', color: '#E043A9' },
  4: { commonName: 'Fish', symbol: '🐟', color: '#1259DE' },
  5: { commonName: 'Insects', symbol: '🦟', color: '#A80915' },
  6: { commonName: 'Mammals', symbol: '🐗', color: '#F5A700' },
  [DEFAULT_TAXON_ID]: { commonName: 'Others', symbol: '❔', color: '#B177FC' }
}
