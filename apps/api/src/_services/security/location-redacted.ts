export const PROTECTED_RISK_RATING_IDS = [600]

export async function isProtectedSpecies (riskRatingIucnId: number): Promise<boolean> {
  return PROTECTED_RISK_RATING_IDS.includes(riskRatingIucnId)
}
