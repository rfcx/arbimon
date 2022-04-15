import { masterRiskRatings, RiskId } from '@rfcx-bio/common/dao/master-data'

export interface RiskRatingUi {
  code: string
  label: string
  color: string
}

// TODO: Can probably remove code from this (it's part of master-data)
export const RISKS_BY_ID: Record<RiskId, RiskRatingUi> = {
  [masterRiskRatings.NE.id]: { code: 'NE', label: 'Not Evaluated', color: '#AAAAAA' },
  [masterRiskRatings.NA.id]: { code: 'NA', label: 'Not Applicable', color: '#888888' },
  [masterRiskRatings.DD.id]: { code: 'DD', label: 'Data Deficient', color: '#755F85' },
  [masterRiskRatings.LC.id]: { code: 'LC', label: 'Least Concern', color: '#2F6E61' },
  [masterRiskRatings.NT.id]: { code: 'NT', label: 'Near Threatened', color: '#5F9E61' },
  [masterRiskRatings.VU.id]: { code: 'VU', label: 'Vulnerable', color: '#C49A33' },
  [masterRiskRatings.EN.id]: { code: 'EN', label: 'Endangered', color: '#C06B3D' },
  [masterRiskRatings.CR.id]: { code: 'CR', label: 'Critically Endangered', color: '#BD3F38' },
  [masterRiskRatings.RE.id]: { code: 'RE', label: 'Regionally Extinct', color: '#444444' },
  [masterRiskRatings.EW.id]: { code: 'EW', label: 'Extinct in the Wild', color: '#222222' },
  [masterRiskRatings.EX.id]: { code: 'EX', label: 'Extinct', color: '#000000' }
}
