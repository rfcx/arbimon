import { type ValueOf } from '@rfcx-bio/utils/utility-types'

import { type RiskRatingIucn } from '@/dao/types'

export const masterRiskRatings = {
  NE: { id: -1, code: 'NE', isThreatened: false, isProtected: false },
  NA: { id: 0, code: 'NA', isThreatened: false, isProtected: false },
  DD: { id: 100, code: 'DD', isThreatened: false, isProtected: false },
  LC: { id: 200, code: 'LC', isThreatened: false, isProtected: false },
  NT: { id: 300, code: 'NT', isThreatened: true, isProtected: false },
  VU: { id: 400, code: 'VU', isThreatened: true, isProtected: false },
  EN: { id: 500, code: 'EN', isThreatened: true, isProtected: false },
  CR: { id: 600, code: 'CR', isThreatened: true, isProtected: true },
  RE: { id: 700, code: 'RE', isThreatened: false, isProtected: false },
  EW: { id: 800, code: 'EW', isThreatened: false, isProtected: false },
  EX: { id: 900, code: 'EX', isThreatened: false, isProtected: false }
} as const

export type RiskId = ValueOf<typeof masterRiskRatings>['id']
export const riskRatings: readonly RiskRatingIucn[] = Object.values(masterRiskRatings)

export const RISK_RATING_THREATENED_IDS = riskRatings.filter(rr => rr.isThreatened).map(rr => rr.id)
export const RISK_RATING_THREATENED_IDS_SET = new Set(RISK_RATING_THREATENED_IDS)

export const RISK_RATING_PROTECTED_ID = 600
