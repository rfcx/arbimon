export interface RiskRatingUi {
  code: string
  label: string
  color: string
  text: string
}

/**
 * WARNING: Risk rating IDs must match the Bio Database IDs
 */
export const DEFAULT_RISK_RATING_ID = -1
export const RISKS_BY_ID: Record<number, RiskRatingUi> = {
  [DEFAULT_RISK_RATING_ID]: { code: 'NL', label: 'Not Listed', color: '#AAAAAA' },
  0: { code: 'NE', label: 'Not Evaluated', color: '#F9F6F2' },
  100: { code: 'DD', label: 'Data Deficient', color: '#A1A19E' },
  200: { code: 'LC', label: 'Least Concern', color: '#00543B', text: '#FFFEFC' },
  300: { code: 'NT', label: 'Near Threatened', color: '#00AF90', text: '#060508' },
  400: { code: 'VU', label: 'Vulnerable', color: '#FFC946', text: '#060508' },
  500: { code: 'EN', label: 'Endangered', color: '#FFA541', text: '#060508' },
  600: { code: 'CR', label: 'Critically Endangered', color: '#A31A33', text: '#FFFEFC' },
  700: { code: 'RE', label: 'Regionally Extinct', color: '#4B4B4B' },
  800: { code: 'EW', label: 'Extinct in the Wild', color: '#242424' },
  900: { code: 'EX', label: 'Extinct', color: '#000000' }
}
