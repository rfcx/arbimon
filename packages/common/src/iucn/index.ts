import { keyBy } from 'lodash-es'

const EXTINCTION_RISK_CODES_AND_LABELS = <const>[
  { code: 'NE', label: 'Not Evaluated', color: '#AAAAAA' },
  { code: 'NA', label: 'Not Applicable', color: '#AAAAAA' },
  { code: 'DD', label: 'Data Deficient', color: '#755F85' },
  { code: 'LC', label: 'Least Concern', color: '#2F6E61' },
  { code: 'NT', label: 'Near Threatened', color: '#2F6E61' },
  { code: 'VU', label: 'Vulnerable', color: '#C49A33' },
  { code: 'EN', label: 'Endangered', color: '#C06B3D' },
  { code: 'CR', label: 'Critically Endangered', color: '#BD3F38' },
  { code: 'RE', label: 'Regionally Extinct', color: '#000000' },
  { code: 'EW', label: 'Extinct in the Wild', color: '#000000' },
  { code: 'EX', label: 'Extinct', color: '#000000' }
]

export const EXTINCTION_RISKS = EXTINCTION_RISK_CODES_AND_LABELS
  .map(({ code, label, color }, level) => ({ code, label, color, level }))

export type ExtinctionRisk = typeof EXTINCTION_RISKS[number]
export type ExtinctionRiskCode = typeof EXTINCTION_RISKS[number]['code']

export const EXTINCTION_RISKS_KEYED = keyBy(EXTINCTION_RISKS, 'code') as Record<ExtinctionRiskCode, ExtinctionRisk>
export const EXTINCTION_RISK_NOT_EVALUATED: ExtinctionRisk = EXTINCTION_RISKS_KEYED.NE

export const EXTINCTION_RISK_THREATENED_CODES: ExtinctionRiskCode[] = ['VU', 'EN', 'CR']

export const getExtinctionRisk = (code: ExtinctionRiskCode): ExtinctionRisk =>
  EXTINCTION_RISKS_KEYED[code] ??
  EXTINCTION_RISK_NOT_EVALUATED
