type RiskCode = 'NE'| 'NA'| 'DD'| 'LC'| 'NT'| 'VU'| 'EN'| 'CR'| 'RE'| 'EW'| 'EX'

export interface RiskRatingIucn {
  id: number
  code: RiskCode
  isThreatened: boolean
}
