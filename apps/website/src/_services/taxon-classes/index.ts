export interface TaxonClassUi {
  color: string
  symbol: string
  label: string
}

/**
 * WARNING: IDs must match master-data in Bio DB
 */
export const DEFAULT_TAXON_ID = 999
export const TAXON_CLASSES_BY_ID: Record<number, TaxonClassUi> = {
  [DEFAULT_TAXON_ID]: { label: 'Others', symbol: '❔', color: '#B177FC' },
  100: { label: 'Amphibians', symbol: '🐸', color: '#02A84F' },
  200: { label: 'Mammals', symbol: '🐗', color: '#F5A700' }, // used to be bat, but got combine to mammals
  300: { label: 'Birds', symbol: '🐦', color: '#E043A9' },
  400: { label: 'Fish', symbol: '🐟', color: '#1259DE' },
  500: { label: 'Insects', symbol: '🦟', color: '#A80915' },
  600: { label: 'Mammals', symbol: '🐗', color: '#F5A700' }
}
