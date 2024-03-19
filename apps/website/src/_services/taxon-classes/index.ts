export interface TaxonClassUi {
  color: string
  symbol: string
  label: string
  text: string
}

/**
 * WARNING: IDs must match master-data in Bio DB
 */
export const DEFAULT_TAXON_ID = 999
export const TAXON_CLASSES_BY_ID: Record<number, TaxonClassUi> = {
  [DEFAULT_TAXON_ID]: { label: 'Others', symbol: '❔', color: '#B177FC', text: '#FFFEFC' },
  100: { label: 'Amphibians', symbol: '🐸', color: '#003F5C', text: '#FFFEFC' },
  200: { label: 'Mammals', symbol: '🐗', color: '#7D447D', text: '#FFFEFC' }, // used to be bat, but got combine to mammals
  300: { label: 'Birds', symbol: '🐦', color: '#444E86', text: '#FFFEFC' },
  400: { label: 'Fish', symbol: '🐟', color: '#1259DE', text: '#FFFEFC' },
  500: { label: 'Insects', symbol: '🦟', color: '#A80915', text: '#FFFEFC' },
  600: { label: 'Mammals', symbol: '🐗', color: '#F5A700', text: '#FFFEFC' }
}
