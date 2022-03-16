const RISK_RATING_DEFAULT_ID = -1

/**
 * @deprecated - Decide this with your DB query
 */
export const RISK_RATING_PROTECTED_IDS = [600]

/**
 * @deprecated - Decide this with your DB query
 */
export const isProtectedSpecies = (riskRatingId?: number | null): boolean =>
  RISK_RATING_PROTECTED_IDS.includes(riskRatingId ?? RISK_RATING_DEFAULT_ID)
