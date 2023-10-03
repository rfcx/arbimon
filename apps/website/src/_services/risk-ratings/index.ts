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
  [DEFAULT_RISK_RATING_ID]: { code: 'NL', label: 'Not Listed', color: '#AAAAAA' },
  0: { code: 'NE', label: 'Not Evaluated', color: '#F9F6F2' },
  100: { code: 'DD', label: 'Data Deficient', color: '#7F7D78' },
  200: { code: 'LC', label: 'Least Concern', color: '#008059' },
  300: { code: 'NT', label: 'Near Threatened', color: '#00AF90' },
  400: { code: 'VU', label: 'Vulnerable', color: '#FFC946' },
  500: { code: 'EN', label: 'Endangered', color: '#FF9457' },
  600: { code: 'CR', label: 'Critically Endangered', color: '#CC1E3D' },
  700: { code: 'RE', label: 'Regionally Extinct', color: '#444444' },
  800: { code: 'EW', label: 'Extinct in the Wild', color: '#222222' },
  900: { code: 'EX', label: 'Extinct', color: '#000000' }
}
