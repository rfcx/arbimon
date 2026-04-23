import { type AccountTier, type ProjectType } from '@rfcx-bio/common/dao/types'

export interface ProjectUsageLimitSummary {
  recordingMinutesCount: number | null
  collaboratorCount: number | null
  guestCount: number | null
  jobCount: number | null
}

export const ACCOUNT_TIER_LABELS: Record<AccountTier, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise'
}

export const ACCOUNT_TIER_DESCRIPTIONS: Record<AccountTier, string> = {
  free: 'Includes up to 5 Free projects.',
  pro: 'Includes up to 50 Free projects and 2 Premium projects.',
  enterprise: 'Includes unlimited Free and Premium projects plus 1 Unlimited project.'
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  free: 'Free',
  premium: 'Premium',
  unlimited: 'Unlimited'
}

export const getAllowedProjectTypesForTier = (tier: AccountTier): ProjectType[] => {
  if (tier === 'enterprise') return ['unlimited', 'premium', 'free']
  if (tier === 'pro') return ['premium', 'free']
  return ['free']
}

export const formatTierLimit = (limit: number | null): string => {
  return limit === null ? 'Unlimited' : String(limit)
}

export const getProjectTypeCreateDescription = (projectType: ProjectType): string => {
  if (projectType === 'premium') return 'Private or public with premium project limits.'
  if (projectType === 'unlimited') return 'Unlimited-capacity project type for Enterprise.'
  return 'Public only, for projects under the Free project-type rules.'
}

export const getProjectTypeUsageLimits = (projectType: ProjectType): ProjectUsageLimitSummary => {
  if (projectType === 'premium') {
    return {
      recordingMinutesCount: 1000000,
      collaboratorCount: 4,
      guestCount: 3,
      jobCount: 200
    }
  }

  if (projectType === 'unlimited') {
    return {
      recordingMinutesCount: null,
      collaboratorCount: null,
      guestCount: null,
      jobCount: null
    }
  }

  return {
    recordingMinutesCount: 40000,
    collaboratorCount: 0,
    guestCount: 0,
    jobCount: 50
  }
}
