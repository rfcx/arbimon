// TODO: Standardize approach for master data
type RiskCode = 'NE'| 'NA'| 'DD'| 'LC'| 'NT'| 'VU'| 'EN'| 'CR'| 'RE'| 'EW'| 'EX'

export interface RiskRating {
  id: number
  code: RiskCode
  isThreatened: boolean
}
