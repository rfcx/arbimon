import { type RiskRatingIucn } from '@rfcx-bio/common/dao/types'

export const rawRiskRatings: RiskRatingIucn[] = [
  { id: -1, code: 'NL', isThreatened: false },
  { id: 0, code: 'NE', isThreatened: false },
  { id: 100, code: 'DD', isThreatened: false },
  { id: 200, code: 'LC', isThreatened: false },
  { id: 300, code: 'NT', isThreatened: true },
  { id: 400, code: 'VU', isThreatened: true },
  { id: 500, code: 'EN', isThreatened: true },
  { id: 600, code: 'CR', isThreatened: true },
  { id: 700, code: 'RE', isThreatened: false },
  { id: 800, code: 'EW', isThreatened: false },
  { id: 900, code: 'EX', isThreatened: false }
]
