import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'

const RISK_RATING_DEFAULT_ID = masterRiskRatings.NE.id

/**
 * @deprecated - Decide this with your DB query
 */
export const RISK_RATING_PROTECTED_IDS: number[] = [masterRiskRatings.CR.id]

/**
 * @deprecated - Decide this with your DB query
 */
export const isProtectedSpecies = (riskRatingId?: number | null): boolean =>
  RISK_RATING_PROTECTED_IDS.includes(riskRatingId ?? RISK_RATING_DEFAULT_ID)
