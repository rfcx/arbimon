export interface TaxonClassUi {
  color: string
  symbol: string
}

/**
 * WARNING: IDs must match master-data in Bio DB
 */
export const DEFAULT_TAXON_ID = -1
export const TAXON_CLASSES_BY_ID: Record<number, TaxonClassUi> = {
  [DEFAULT_TAXON_ID]: { symbol: '❔', color: '#B177FC' },
  100: { symbol: '🐸', color: '#02A84F' },
  200: { symbol: '🦇', color: '#0B378A' },
  300: { symbol: '🐦', color: '#E043A9' },
  400: { symbol: '🐟', color: '#1259DE' },
  500: { symbol: '🦟', color: '#A80915' },
  600: { symbol: '🐗', color: '#F5A700' }
}
