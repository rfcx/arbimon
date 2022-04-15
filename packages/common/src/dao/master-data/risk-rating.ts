import { ValueOf } from '@rfcx-bio/utils/utility-types'

import { RiskRating } from '@/dao/types'

export const masterRiskRatings = <const>{
  NE: { id: -1, code: 'NE', isThreatened: false },
  NA: { id: 0, code: 'NA', isThreatened: false },
  DD: { id: 100, code: 'DD', isThreatened: false },
  LC: { id: 200, code: 'LC', isThreatened: false },
  NT: { id: 300, code: 'NT', isThreatened: false },
  VU: { id: 400, code: 'VU', isThreatened: true },
  EN: { id: 500, code: 'EN', isThreatened: true },
  CR: { id: 600, code: 'CR', isThreatened: true },
  RE: { id: 700, code: 'RE', isThreatened: false },
  EW: { id: 800, code: 'EW', isThreatened: false },
  EX: { id: 900, code: 'EX', isThreatened: false }
}

export type RiskId = ValueOf<typeof masterRiskRatings>['id']
export const riskRatings: readonly RiskRating[] = Object.values(masterRiskRatings)
