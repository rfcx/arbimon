import { ExtinctionRiskCode } from '../../iucn'

export interface RiskRatingIucn {
  idOrdered: number
  code: ExtinctionRiskCode
  isThreatened: boolean
}
