import { keyBy } from 'lodash-es'

const EXTINCTION_RISK_CODES_AND_LABELS = <const>[
  { code: 'NE', label: 'Not Evaluated' },
  { code: 'NA', label: 'Not Applicable' },
  { code: 'DD', label: 'Data Deficient' },
  { code: 'LC', label: 'Least Concern' },
  { code: 'NT', label: 'Near Threatened' },
  { code: 'VU', label: 'Vulnerable' },
  { code: 'EN', label: 'Endangered' },
  { code: 'CR', label: 'Critically Endangered' },
  { code: 'RE', label: 'Regionally Extinct' },
  { code: 'EW', label: 'Extinct in the Wild' },
  { code: 'EX', label: 'Extinct' }
]

export const EXTINCTION_RISKS = EXTINCTION_RISK_CODES_AND_LABELS
  .map(({ code, label }, level) => ({ code, label, level }))

export type ExtinctionRisk = typeof EXTINCTION_RISKS[number]
export type ExtinctionRiskCode = typeof EXTINCTION_RISKS[number]['code']

export const EXTINCTION_RISKS_KEYED = keyBy(EXTINCTION_RISKS, 'code') as Record<ExtinctionRiskCode, ExtinctionRisk>
export const EXTINCTION_RISK_NOT_EVALUATED: ExtinctionRisk = EXTINCTION_RISKS_KEYED.NE

export const EXTINCTION_RISK_THREATENED_CODES: ExtinctionRiskCode[] = ['VU', 'EN', 'CR']

export const getExtinctionRisk = (code: ExtinctionRiskCode): ExtinctionRisk =>
  EXTINCTION_RISKS_KEYED[code] ??
  EXTINCTION_RISK_NOT_EVALUATED
