import { keyBy, mapValues } from 'lodash-es'

/**
 * Source data
 * The order of this array defines the `level` property
 */
const EXTINCTION_RISKS_RAW = <const>[
  { code: 'NE', label: 'Not Evaluated', color: '#AAAAAA' },
  { code: 'NA', label: 'Not Applicable', color: '#888888' },
  { code: 'DD', label: 'Data Deficient', color: '#755F85' },
  { code: 'LC', label: 'Least Concern', color: '#2F6E61' },
  { code: 'NT', label: 'Near Threatened', color: '#5F9E61' },
  { code: 'VU', label: 'Vulnerable', color: '#C49A33' },
  { code: 'EN', label: 'Endangered', color: '#C06B3D' },
  { code: 'CR', label: 'Critically Endangered', color: '#BD3F38' },
  { code: 'RE', label: 'Regionally Extinct', color: '#444444' },
  { code: 'EW', label: 'Extinct in the Wild', color: '#222222' },
  { code: 'EX', label: 'Extinct', color: '#000000' }
]

// Types & list
export const EXTINCTION_RISKS = EXTINCTION_RISKS_RAW
  .map(({ code, label, color }, level) => ({ code, label, color, level }))

export type ExtinctionRisk = typeof EXTINCTION_RISKS[number]
export type ExtinctionRiskCode = typeof EXTINCTION_RISKS[number]['code']

// Lookups
const EXTINCTION_RISKS_KEYED = keyBy(EXTINCTION_RISKS, 'code') as Record<ExtinctionRiskCode, ExtinctionRisk>
export const getExtinctionRisk = (code: ExtinctionRiskCode): ExtinctionRisk =>
  EXTINCTION_RISKS_KEYED[code] ??
  EXTINCTION_RISKS_KEYED.NE

// Constants
export const EXTINCTION_RISK_NOT_EVALUATED = EXTINCTION_RISKS_KEYED.NE
export const EXTINCTION_RISK_THREATENED_CODES: ExtinctionRiskCode[] = ['VU', 'EN', 'CR']
export const EXTINCTION_RISK_PROTECTED_CODES: ExtinctionRiskCode[] = [] // ['CR']

export const EXTINCTION_CODES_AND_COLORS = mapValues(keyBy(EXTINCTION_RISKS, 'code'), 'color')
export const EXTINCTION_LABELS_AND_COLORS = mapValues(keyBy(EXTINCTION_RISKS, 'label'), 'color')
