export interface RiskRatingUi {
  code: string
  label: string
  color: string
}

/**
 * WARNING: Risk rating IDs must match the Bio Database IDs
 */
export const DEFAULT_RISK_RATING_ID = -1
export const RISKS_BY_ID: Record<number, RiskRatingUi> = {
  [DEFAULT_RISK_RATING_ID]: { code: 'NA', label: 'Not Available', color: '#AAAAAA' },
  0: { code: 'NE', label: 'Not Evaluated', color: '#888888' },
  100: { code: 'DD', label: 'Data Deficient', color: '#755F85' },
  200: { code: 'LC', label: 'Least Concern', color: '#2F6E61' },
  300: { code: 'NT', label: 'Near Threatened', color: '#5F9E61' },
  400: { code: 'VU', label: 'Vulnerable', color: '#C49A33' },
  500: { code: 'EN', label: 'Endangered', color: '#C06B3D' },
  600: { code: 'CR', label: 'Critically Endangered', color: '#BD3F38' },
  700: { code: 'RE', label: 'Regionally Extinct', color: '#444444' },
  800: { code: 'EW', label: 'Extinct in the Wild', color: '#222222' },
  900: { code: 'EX', label: 'Extinct', color: '#000000' }
}
